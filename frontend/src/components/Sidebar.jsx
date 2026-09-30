import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  ArrowUpRight,
  Camera,
  ChevronDown,
  Film,
  MessageCircle,
  Paperclip,
  Search,
  SquarePen,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useChat } from "../stores/chat";
import {
  Avatar,
  Button,
  ErrorNotice,
  IconButton,
  Input,
  SegmentedControl,
  Spinner,
} from "./ui";
import { InstallButton } from "./Pwa";
import { timeLabel } from "../lib/format";
import { cn } from "../lib/utils";

export default function Sidebar({ onNew, onSettings }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const state = useChat(
    useShallow(
      ({
        profile,
        conversations,
        activeId,
        onlineUsers,
        unread,
        listLoading,
        listError,
        loadConversations,
        selectConversation,
        connection,
        networkOnline,
      }) => ({
        profile,
        conversations,
        activeId,
        onlineUsers,
        unread,
        listLoading,
        listError,
        loadConversations,
        selectConversation,
        connection,
        networkOnline,
      }),
    ),
  );

  const unreadCount = Object.values(state.unread).reduce(
    (sum, count) => sum + count,
    0,
  );

  const conversations = state.conversations.filter(
    (user) =>
      user.fullName.toLowerCase().includes(query.toLowerCase()) &&
      (filter !== "unread" || state.unread[user._id]),
  );

  function renderMessageSnippet(lastMessage) {
    if (!lastMessage) return "Start a conversation";
    const isMine = lastMessage.senderId === state.profile?._id;
    const prefix = isMine ? "You: " : "";

    if (lastMessage.image) {
      return (
        <span className="inline-flex items-center gap-1.5">
          <Camera size={13} className="shrink-0 text-muted-foreground" />
          <span>{prefix}Photo</span>
        </span>
      );
    }
    if (lastMessage.video) {
      return (
        <span className="inline-flex items-center gap-1.5">
          <Film size={13} className="shrink-0 text-muted-foreground" />
          <span>{prefix}Video</span>
        </span>
      );
    }
    if (lastMessage.file) {
      return (
        <span className="inline-flex items-center gap-1.5">
          <Paperclip size={13} className="shrink-0 text-muted-foreground" />
          <span>{prefix}Attachment</span>
        </span>
      );
    }
    return prefix + (lastMessage.text || "Message");
  }

  return (
    <aside
      aria-label="Conversations"
      className={cn(
        "flex min-h-0 min-w-0 w-full flex-1 flex-col bg-sidebar",
        state.activeId && "hidden md:flex",
      )}
    >
      {/* Title & Compose Button */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-medium tracking-tight text-foreground">
            Messages
          </h1>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center rounded-md bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
              {unreadCount} new
            </span>
          )}
        </div>
        <IconButton
          label="New message"
          onClick={onNew}
          className="border border-border/80 bg-surface text-foreground shadow-xs hover:border-primary/40 hover:bg-muted"
        >
          <SquarePen size={18} />
        </IconButton>
      </div>

      {/* Search Input */}
      <div className="relative mx-5 mb-3 md:mx-6">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-3.5 z-10 text-muted-foreground"
        />
        <Input
          id="conversation-search"
          aria-label="Search conversations"
          placeholder="Search conversations"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-10 bg-surface/75 pl-10 pr-10 text-xs sm:text-xs"
        />
        {query ? (
          <IconButton
            label="Clear search"
            onClick={() => setQuery("")}
            className="absolute right-1 top-0 size-10"
          >
            <X size={14} />
          </IconButton>
        ) : (
          <span className="pointer-events-none absolute right-3 top-2.5 hidden select-none rounded border border-border/80 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            /
          </span>
        )}
      </div>

      {/* Segmented Filter Control */}
      <div className="mx-5 mb-2 md:mx-6">
        <SegmentedControl
          label="Filter conversations"
          value={filter}
          onChange={setFilter}
          options={[
            {
              value: "all",
              label: "All",
              count: state.conversations.length,
            },
            { value: "unread", label: "Unread", count: unreadCount },
          ]}
        />
      </div>

      {/* Section Counter Bar */}
      <div className="flex items-center justify-between px-6 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>
          {filter === "unread"
            ? "Unread conversations"
            : "Recent conversations"}
        </span>
        <span className="tabular-nums">{conversations.length}</span>
      </div>

      {/* Conversations List */}
      <div
        className="min-h-0 flex-1 overflow-y-auto px-2 pb-3"
        aria-label="Conversation list"
        onKeyDown={(event) => {
          if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key))
            return;
          const buttons = [
            ...event.currentTarget.querySelectorAll("[data-conversation]"),
          ];
          const index = buttons.indexOf(document.activeElement);
          if (index < 0) return;
          event.preventDefault();
          const next =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? buttons.length - 1
                : (index +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    buttons.length) %
                  buttons.length;
          buttons[next]?.focus();
        }}
      >
        {state.listError && (
          <ErrorNotice
            message={state.listError}
            onRetry={state.loadConversations}
          />
        )}
        {state.listLoading && !state.conversations.length ? (
          <Spinner label="Loading conversations…" />
        ) : conversations.length ? (
          conversations.map((user) => {
            const isSelected = state.activeId === user._id;
            const hasUnread = state.unread[user._id] > 0;
            return (
              <button
                key={user._id}
                data-conversation={user._id}
                onClick={() => {
                  state.selectConversation(user);
                  requestAnimationFrame(() =>
                    document.getElementById("chat-tile")?.focus(),
                  );
                }}
                aria-current={isSelected ? "true" : undefined}
                className={cn(
                  "group relative my-1 flex w-full items-center gap-3 rounded-md border border-transparent p-3 text-left transition-colors duration-150  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-primary/35 bg-accent"
                    : "hover:bg-muted/70",
                )}
              >
                {/* Active indicator bar */}
                {isSelected && (
                  <motion.span
                    layoutId="active-conversation-pill"
                    className="absolute left-0 h-8 w-1 rounded-r-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}

                <Avatar
                  user={user}
                  online={state.onlineUsers.includes(user._id)}
                  className="size-11"
                />

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <strong
                      className={cn(
                        "truncate text-sm font-semibold text-foreground",
                        hasUnread && "font-bold",
                      )}
                    >
                      {user.fullName}
                    </strong>
                    <time className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                      {timeLabel(user.lastMessage)}
                    </time>
                  </span>

                  <span className="mt-1 flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "truncate text-xs leading-5 text-muted-foreground",
                        hasUnread && "font-medium text-foreground",
                      )}
                    >
                      {renderMessageSnippet(user.lastMessage)}
                    </span>

                    {hasUnread && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground shadow-xs">
                        {state.unread[user._id] > 99
                          ? "99+"
                          : state.unread[user._id]}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-border/80 bg-surface p-3 text-muted-foreground shadow-xs">
              <MessageCircle size={24} strokeWidth={1.5} />
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              {query
                ? "No conversations found"
                : filter === "unread"
                  ? "You’re all caught up"
                  : "A fresh start"}
            </h3>
            <p className="mt-1.5 max-w-56 text-xs leading-relaxed text-muted-foreground">
              {query
                ? "Try searching for another name."
                : filter === "unread"
                  ? "New messages will appear here."
                  : "Start reaching out to your friends on Chime."}
            </p>
            {!query && filter === "all" && (
              <Button
                variant="outline"
                size="small"
                className="mt-4 gap-1.5 text-xs text-primary shadow-xs"
                onClick={onNew}
              >
                Start a conversation
                <ArrowUpRight size={13} />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* User Status & Preferences Footer */}
      <div className="safe-bottom border-t border-border/80 bg-surface/50 p-3 ">
        <InstallButton />
        <button
          onClick={onSettings}
          aria-label="Account and appearance settings"
          className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-transparent p-2 text-left transition-colors duration-150  hover:border-border/60 hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar user={state.profile} size="avatar-small" />
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-xs font-semibold text-foreground">
              {state.profile?.fullName || "Your Account"}
            </strong>
            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span
                role="status"
                aria-label={
                  !state.networkOnline
                    ? "Offline"
                    : state.connection === "connected"
                      ? "Connected"
                      : "Connecting"
                }
                className={cn(
                  "size-1.5 rounded-md",
                  state.connection === "connected"
                    ? "bg-status "
                    : !state.networkOnline
                      ? "bg-destructive"
                      : "bg-muted-foreground animate-pulse",
                )}
              />
              {!state.networkOnline
                ? "Offline"
                : state.connection === "connected"
                  ? "Connected"
                  : "Connecting…"}
            </span>
          </span>
          <ChevronDown size={15} className="text-muted-foreground" />
        </button>
      </div>
    </aside>
  );
}
