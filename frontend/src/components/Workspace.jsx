import { useEffect, useRef, useState } from "react";
import {
  Columns2,
  Command,
  Keyboard,
  Maximize2,
  Search,
  Terminal,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useChat } from "../stores/chat";
import { useWorkspace } from "../stores/workspace";
import { COMMANDS } from "../lib/commands";
import { Brand, Button, IconButton, Input, Modal, ThemeMenu } from "./ui";
import { cn } from "../lib/utils";

export function Tile({ title, index, children, className, id, hint }) {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-label={title}
      className={cn("tile", className)}
    >
      <div className="tile-title">
        <span>
          <span className="text-primary">{index}</span>
          {title}
        </span>
        {hint && <span className="text-[10px] text-secondary">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function TileDivider({ gridRef }) {
  const width = useWorkspace((state) => state.sidebarWidth);
  const setWidth = useWorkspace((state) => state.setSidebarWidth);
  const [limit, setLimit] = useState(420);
  const pending = useRef(null);
  const frame = useRef(null);
  const effective = Math.min(width, limit);
  useEffect(() => {
    const observer = new ResizeObserver(() =>
      setLimit(
        Math.max(240, Math.min(420, Math.floor(window.innerWidth * 0.42))),
      ),
    );
    if (gridRef.current) observer.observe(gridRef.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, [gridRef]);
  function resize(event) {
    const left = gridRef.current?.getBoundingClientRect().left || 0;
    pending.current = Math.max(240, Math.min(limit, event.clientX - left));
    const separator = event.currentTarget;
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      if (pending.current !== null) {
        gridRef.current?.style.setProperty(
          "--sidebar-width",
          `${pending.current}px`,
        );
        separator.setAttribute("aria-valuenow", Math.round(pending.current));
      }
      frame.current = null;
    });
  }
  function finish(event) {
    if (pending.current === null) return;
    cancelAnimationFrame(frame.current);
    frame.current = null;
    setWidth(pending.current);
    pending.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  return (
    <div
      role="separator"
      aria-label="Resize conversation tile"
      aria-orientation="vertical"
      aria-valuemin={240}
      aria-valuemax={limit}
      aria-valuenow={Math.round(effective)}
      aria-controls="conversations-tile"
      tabIndex={0}
      className="tile-divider"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.focus();
        resize(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          resize(event);
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
      onLostPointerCapture={finish}
      onDoubleClick={() => setWidth(304)}
      onKeyDown={(event) => {
        const changes = {
          ArrowLeft: effective - 16,
          ArrowRight: Math.min(limit, effective + 16),
          Home: 240,
          End: limit,
        };
        if (event.key in changes) {
          event.preventDefault();
          setWidth(changes[event.key]);
        }
      }}
    />
  );
}

function CommandLauncher({ onClose, onRun, activeId }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const choices = COMMANDS.filter((item) =>
    `${item.label} ${item.detail}`.toLowerCase().includes(query.toLowerCase()),
  );
  const available = choices.filter((item) => !item.needsChat || activeId);
  const current =
    available[Math.min(selected, Math.max(0, available.length - 1))];
  const listRef = useRef(null);
  const executing = useRef(false);
  const execute = (id) => {
    executing.current = true;
    onRun(id);
  };
  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [selected, query]);
  return (
    <Modal
      title="Command launcher"
      description="Find an action. Use ↑ ↓ to navigate and Enter to run."
      onClose={onClose}
      onCloseAutoFocus={(event) => {
        if (executing.current) event.preventDefault();
      }}
      className="max-w-xl"
    >
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3.5 text-primary" />
        <Input
          autoFocus
          role="combobox"
          aria-label="Search commands"
          aria-autocomplete="list"
          aria-expanded="true"
          aria-controls="workspace-commands"
          aria-activedescendant={current ? `command-${current.id}` : undefined}
          value={query}
          placeholder="Type a command…"
          className="pl-10 font-mono"
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setSelected(
                (value) =>
                  (value +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    available.length) %
                  (available.length || 1),
              );
            }
            if (event.key === "Enter" && current) {
              event.preventDefault();
              execute(current.id);
            }
          }}
        />
      </div>
      <div
        id="workspace-commands"
        ref={listRef}
        role="listbox"
        aria-label="Workspace commands"
        className="mt-3 max-h-[45dvh] space-y-1 overflow-y-auto"
      >
        {choices.map((item) => {
          const disabled = item.needsChat && !activeId;
          return (
            <div
              key={item.id}
              id={`command-${item.id}`}
              role="option"
              aria-selected={current?.id === item.id}
              aria-disabled={disabled || undefined}
              onPointerMove={() => {
                const index = available.indexOf(item);
                if (index >= 0) setSelected(index);
              }}
              onClick={() => {
                if (!disabled) execute(item.id);
              }}
              className={cn(
                "flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-md border border-transparent px-3 py-2",
                current?.id === item.id && "border-primary/40 bg-accent",
                disabled && "cursor-not-allowed opacity-45",
              )}
            >
              <div>
                <p className="font-mono text-xs">{item.label}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {disabled ? "Select a conversation first" : item.detail}
                </p>
              </div>
              {item.shortcut && (
                <kbd className="hidden shrink-0 sm:inline">{item.shortcut}</kbd>
              )}
            </div>
          );
        })}
        {!choices.length && (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            No commands found.
          </p>
        )}
      </div>
      <p className="mt-4 border-t pt-3 font-mono text-[10px] text-muted-foreground">
        ↑ ↓ navigate · enter run · esc close
      </p>
    </Modal>
  );
}

export function WorkspaceShell({ conversations, chat, onNew, onSettings }) {
  const activeId = useChat((state) => state.activeId);
  const network = useChat((state) => state.networkOnline);
  const connection = useChat((state) => state.connection);
  const width = useWorkspace((state) => state.sidebarWidth);
  const layout = useWorkspace((state) => state.layout);
  const [overlay, setOverlay] = useState(null);
  const gridRef = useRef(null);
  const focusLayout = layout === "focus" && activeId;
  const connected = network && connection === "connected";
  const status = !network
    ? "offline"
    : connected
      ? "connected"
      : "reconnecting";
  const runRef = useRef(null);

  function run(id) {
    setOverlay(null);
    // Radix restores the launcher's focus on close. Run after that restoration.
    setTimeout(() => {
      if (id === "new") onNew();
      if (id === "settings") onSettings();
      if (id === "help") setOverlay("help");
      if (id === "layout") {
        useWorkspace.getState().toggleLayout();
        document.getElementById("chat-tile")?.focus();
      }
      if (id === "reset") useWorkspace.getState().resetLayout();
      if (id === "conversations") {
        useWorkspace.setState({ layout: "split" });
        if (window.innerWidth < 768) useChat.getState().clearSelection();
        requestAnimationFrame(() =>
          document.getElementById("conversation-search")?.focus(),
        );
      }
      if (id === "compose") document.getElementById("message-input")?.focus();
    }, 0);
  }
  useEffect(() => {
    runRef.current = run;
  });
  useEffect(() => {
    function keydown(event) {
      if (event.isComposing || event.repeat) return;
      if (
        document.querySelector(
          '[role="dialog"], [data-radix-popper-content-wrapper] [role="menu"]',
        )
      )
        return;
      if (
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setOverlay("commands");
        return;
      }
      if (
        event.target.closest?.(
          'input, textarea, [contenteditable="true"], [role="combobox"]',
        )
      )
        return;
      if (
        event.key === "/" &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey
      ) {
        event.preventDefault();
        runRef.current("conversations");
        return;
      }
      const command =
        event.altKey &&
        event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        COMMANDS.find((item) => item.code === event.code);
      if (command && (!command.needsChat || useChat.getState().activeId)) {
        event.preventDefault();
        runRef.current(command.id);
      }
    }
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, []);

  return (
    <main className="workspace-shell">
      <a
        href="#conversations-tile"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          run("conversations");
        }}
      >
        Skip to conversations
      </a>
      <header className="surface-blur flex min-w-0 items-center justify-between gap-2 rounded-lg border px-2 py-1.5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Brand small />
          <nav aria-label="Workspaces" className="flex gap-1">
            <Button
              size="small"
              variant="soft"
              className="h-9 px-2.5"
              aria-label="Messages workspace"
              aria-current="page"
              onClick={() => run("conversations")}
            >
              <span className="text-primary">01</span>
              <span className="hidden sm:inline">messages</span>
            </Button>
            <Button
              size="small"
              variant="ghost"
              className="h-9 px-2.5"
              aria-label="Open preferences"
              onClick={onSettings}
            >
              <span className="text-secondary">02</span>
              <span className="hidden lg:inline">settings</span>
            </Button>
          </nav>
          <span className="hidden font-mono text-[10px] text-muted-foreground xl:block">
            chime / workspace
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <span
            role="status"
            className={cn(
              "hidden items-center gap-1.5 font-mono text-[10px] sm:flex",
              connected ? "text-status" : "text-warning",
            )}
          >
            {network ? <Wifi size={13} /> : <WifiOff size={13} />}
            {status}
          </span>
          <IconButton
            label="Open command launcher"
            aria-keyshortcuts="Control+k Meta+k"
            onClick={() => setOverlay("commands")}
          >
            <Command size={17} />
          </IconButton>
          <div className="hidden md:block">
            <IconButton
              label={focusLayout ? "Restore split layout" : "Focus chat tile"}
              disabled={!activeId}
              onClick={() => run("layout")}
            >
              {focusLayout ? <Columns2 size={17} /> : <Maximize2 size={17} />}
            </IconButton>
          </div>
          <ThemeMenu />
        </div>
      </header>
      <div
        ref={gridRef}
        className="workspace-grid"
        data-layout={focusLayout ? "focus" : "split"}
        data-selected={Boolean(activeId)}
        style={{ "--sidebar-width": `${width}px` }}
      >
        <Tile
          id="conversations-tile"
          title="conversations"
          index="01"
          hint="master"
          className="conversation-tile"
        >
          {conversations}
        </Tile>
        <TileDivider gridRef={gridRef} />
        <Tile
          id="chat-tile"
          title="message stream"
          index="02"
          hint={focusLayout ? "focus" : "stack"}
          className="chat-tile"
        >
          {chat}
        </Tile>
      </div>
      <footer className="workspace-footer hidden items-center md:flex justify-between gap-4 px-1 font-mono text-[10px] text-muted-foreground">
        <span className="flex items-center gap-2">
          <Terminal size={12} />
          <span className="text-primary">chime</span>
          <span>/</span>
          {focusLayout ? "focus" : "split"}
          <span>/</span>
          <span>session workspace</span>
        </span>
        <button
          className="flex items-center gap-2 hover:text-primary"
          onClick={() => setOverlay("help")}
        >
          <Keyboard size={13} />
          keybinds <kbd>Alt Shift /</kbd>
        </button>
      </footer>
      {overlay === "commands" && (
        <CommandLauncher
          activeId={activeId}
          onClose={() => setOverlay(null)}
          onRun={run}
        />
      )}
      {overlay === "help" && (
        <Modal
          title="Keyboard shortcuts"
          description="Workspace bindings. Every command is also available from the launcher."
          onClose={() => setOverlay(null)}
        >
          <dl className="space-y-3">
            <div className="flex justify-between gap-3 text-xs">
              <dt>Command launcher</dt>
              <dd>
                <kbd>Ctrl / ⌘ K</kbd>
              </dd>
            </div>
            {COMMANDS.filter((item) => item.shortcut).map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-xs">
                <dt>{item.label}</dt>
                <dd>
                  <kbd>{item.shortcut}</kbd>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 border-t pt-4 text-xs leading-5 text-muted-foreground">
            Tab moves between controls. Use ↑ ↓ in the conversation list. Focus
            the divider and use ← → to resize. Workspace bindings pause while
            typing; Ctrl / ⌘ K still opens the launcher. Your OS may reserve
            some combinations.
          </p>
        </Modal>
      )}
    </main>
  );
}
