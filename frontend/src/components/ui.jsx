import { Component, useRef, useState } from "react";
import {
  Avatar as AvatarPrimitive,
  Dialog,
  DropdownMenu,
  Slot,
  ToggleGroup,
  Tooltip,
} from "radix-ui";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bell,
  Check,
  LoaderCircle,
  Monitor,
  Moon,
  RefreshCw,
  Sun,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { usePreferences } from "../stores/preferences";

export function Button({
  variant = "primary",
  size = "default",
  asChild = false,
  className,
  children,
  ...props
}) {
  const Tag = asChild ? Slot.Root : "button";
  return (
    <Tag
      type={asChild ? undefined : "button"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-[transform,background-color,border-color,color,box-shadow,filter] duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:shrink-0",
        {
          "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110":
            variant === "primary",
          "border border-border bg-surface/80 text-foreground shadow-sm hover:bg-muted hover:border-control":
            variant === "outline",
          "text-muted-foreground hover:bg-muted/60 hover:text-foreground":
            variant === "ghost",
          "bg-accent text-accent-foreground hover:bg-accent/80":
            variant === "soft",
          "border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10":
            variant === "danger",
          "h-11 px-5": size === "default",
          "h-9 rounded-lg px-3.5 text-xs": size === "small",
          "size-10 p-0": size === "icon",
        },
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
export function IconButton({ label, children, className, ...props }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          className={className}
          {...props}
        >
          {children}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={8}
          className="pointer-events-none z-[80] rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background shadow-lg animate-popover select-none"
        >
          {label}
          <Tooltip.Arrow className="fill-foreground" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-border bg-surface/70 px-3.5 text-base outline-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground hover:border-control focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}
export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-11 min-w-0 w-full resize-none bg-transparent px-2 py-3 text-base leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:outline-none md:text-sm",
        className,
      )}
      {...props}
    />
  );
}
export function Avatar({ user, size = "", online = false, className }) {
  const name = user?.fullName || "You";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
  const tone = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4;
  return (
    <span
      className={cn(
        "relative inline-flex size-11 shrink-0",
        size === "avatar-small" && "size-9",
        size === "avatar-large" && "size-16",
        className,
      )}
    >
      <AvatarPrimitive.Root
        className={cn(
          "flex size-full items-center justify-center overflow-hidden rounded-full text-sm font-semibold ring-1 ring-black/5 dark:ring-white/10",
          [
            "bg-primary/15 text-primary",
            "bg-secondary/15 text-secondary",
            "bg-warning/15 text-warning",
            "bg-status/15 text-status",
          ][tone],
          size === "avatar-large" && "text-lg",
        )}
      >
        <AvatarPrimitive.Image
          src={user?.profilePic || undefined}
          alt={name}
          className="size-full object-cover"
          referrerPolicy="no-referrer"
        />
        <AvatarPrimitive.Fallback>{initials}</AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {online && (
        <span className="absolute bottom-0 right-0 flex size-3.5 items-center justify-center">
          <span className="absolute inline-flex size-3.5 rounded-full border-2 border-surface bg-status" />
          <span className="sr-only"> (Online)</span>
        </span>
      )}
    </span>
  );
}
export function Brand({ small = false, iconOnly = false }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-xl font-bold tracking-tight select-none",
        small && "text-base",
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/25 transition-transform",
          small && "size-7 rounded-lg shadow-md",
        )}
      >
        <Bell size={small ? 15 : 18} strokeWidth={2.4} fill="currentColor" />
      </span>
      {!iconOnly && (
        <span className="font-bold text-foreground">
          Chime
        </span>
      )}
      {iconOnly && <span className="sr-only">Chime</span>}
    </span>
  );
}
export function Spinner({ label = "Loading…" }) {
  return (
    <div
      className="flex items-center justify-center gap-2.5 px-4 py-10 text-sm text-muted-foreground"
      role="status"
    >
      <LoaderCircle className="animate-spin" size={18} />
      <span>{label}</span>
    </div>
  );
}
export function ErrorNotice({ message, onRetry }) {
  return (
    <div
      className="my-3 flex items-center gap-2.5 rounded-xl border border-destructive/15 bg-destructive/5 p-3 text-xs leading-relaxed text-destructive"
      role="alert"
    >
      <AlertCircle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <Button
          variant="ghost"
          size="small"
          className="text-destructive"
          onClick={onRetry}
        >
          <RefreshCw size={13} />
          Retry
        </Button>
      )}
    </div>
  );
}
export function Modal({
  title,
  description,
  children,
  onClose,
  className,
  onCloseAutoFocus,
}) {
  const [open, setOpen] = useState(true);
  const previousFocus = useRef(document.activeElement);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence onExitComplete={onClose}>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content
              forceMount
              asChild
              onCloseAutoFocus={(event) => {
                onCloseAutoFocus?.(event);
                if (!event.defaultPrevented) {
                  event.preventDefault();
                  previousFocus.current?.focus();
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border surface-glass p-6 text-foreground shadow-2xl shadow-black/20 outline-none sm:p-7",
                  className,
                )}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="text-lg font-semibold tracking-tight">
                      {title}
                    </Dialog.Title>
                    <Dialog.Description
                      className={
                        description
                          ? "mt-1.5 text-sm leading-relaxed text-muted-foreground"
                          : "sr-only"
                      }
                    >
                      {description || title}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Close dialog"
                      className="-mr-2 -mt-2 size-9"
                    >
                      <X size={18} />
                    </Button>
                  </Dialog.Close>
                </div>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
export function SegmentedControl({
  value,
  onChange,
  options,
  label,
  className,
}) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next);
      }}
      aria-label={label}
      className={cn(
        "flex gap-1 rounded-xl border border-border bg-muted/50 p-1",
        className,
      )}
    >
      {options.map(({ value: key, label: text, icon: Icon, count }) => (
        <ToggleGroup.Item
          key={key}
          value={key}
          className="relative flex min-h-10 sm:min-h-9 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-xs font-medium text-foreground/70 outline-none transition-[background-color,color] duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:bg-surface data-[state=on]:text-foreground data-[state=on]:shadow-sm"
        >
          {Icon && <Icon size={15} />}
          {text}
          {count > 0 && (
            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
              {count}
            </span>
          )}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
export function ThemeMenu() {
  const { theme, setTheme } = usePreferences();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <IconButton label="Choose appearance">
          {theme === "dark" ? (
            <Moon size={19} />
          ) : theme === "light" ? (
            <Sun size={19} />
          ) : (
            <Monitor size={19} />
          )}
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="z-[70] min-w-44 rounded-2xl border border-border surface-glass p-1.5 shadow-xl animate-popover"
        >
          <DropdownMenu.Label className="px-2.5 py-2 text-[11px] font-medium text-muted-foreground">
            Appearance
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={theme} onValueChange={setTheme}>
            {[
              ["light", Sun, "Light"],
              ["dark", Moon, "Dark"],
              ["system", Monitor, "System"],
            ].map(([value, Icon, name]) => (
              <DropdownMenu.RadioItem
                key={value}
                value={value}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm outline-none transition-colors focus:bg-muted"
              >
                <Icon size={16} />
                {name}
                <DropdownMenu.ItemIndicator className="ml-auto">
                  <Check size={14} />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
export class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error("Application error:", error);
  }
  render() {
    if (this.state.failed)
      return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-5 p-6 text-center">
          <Brand />
          <h1 className="text-2xl font-bold tracking-tight">
            Let's try that again.
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Something interrupted the app. Reload to get back to your
            conversations.
          </p>
          <Button onClick={() => window.location.reload()}>Reload app</Button>
        </main>
      );
    return this.props.children;
  }
}
