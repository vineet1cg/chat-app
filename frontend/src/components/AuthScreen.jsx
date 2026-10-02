import { SignIn, SignUp } from "@clerk/react";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Keyboard,
  Layers,
  Shield,
  Sparkles,
  WifiOff,
  Zap,
} from "lucide-react";
import { Brand, Button, ThemeMenu } from "./ui";
import { InstallButton } from "./Pwa";

const FEATURES = [
  {
    icon: Zap,
    title: "Real-time messaging",
    description:
      "Messages arrive instantly over a persistent WebSocket. No polling, no refresh, no waiting.",
  },
  {
    icon: Layers,
    title: "Built for focus",
    description:
      "A command palette, keyboard shortcuts, and a resizable layout keep your hands on the keyboard.",
  },
  {
    icon: Shield,
    title: "Private by design",
    description:
      "Your conversations are yours. No tracking, no telemetry, no algorithms deciding what you see.",
  },
];

const STATS = [
  ["<15ms", "average latency"],
  ["256-bit", "session encryption"],
  ["100%", "your data, your control"],
  ["0", "trackers or ads"],
];

export default function AuthScreen({
  configured = true,
  offline = false,
  connectionError = false,
}) {
  const routeMode = () =>
    window.location.pathname.startsWith("/sign-up")
      ? "signup"
      : window.location.pathname.startsWith("/sign-in")
        ? "signin"
        : "welcome";
  const [mode, setMode] = useState(routeMode);

  useEffect(() => {
    const sync = () => setMode(routeMode());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  useEffect(() => {
    document.title =
      mode === "signin"
        ? "Sign in — Chime"
        : mode === "signup"
          ? "Create your account — Chime"
          : "Chime — Messaging, reimagined.";
  }, [mode]);

  function navigate(next) {
    window.history.pushState(
      {},
      "",
      next === "signup" ? "/sign-up" : next === "signin" ? "/sign-in" : "/",
    );
    setMode(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  const unavailable = !configured || offline || connectionError;
  const welcome = mode === "welcome" || unavailable;

  return (
    <main className="min-h-dvh bg-background">
      {/* Header */}
      <header className="surface-glass sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b px-4 sm:px-6 lg:px-10">
        <Brand />
        <nav
          aria-label="Landing navigation"
          className="hidden items-center gap-6 text-sm text-muted-foreground md:flex"
        >
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#stats" className="transition-colors hover:text-foreground">
            Why Chime
          </a>
          <a href="#install" className="transition-colors hover:text-foreground">
            Install
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeMenu />
          {!welcome && (
            <Button
              variant="ghost"
              size="small"
              onClick={() => navigate("welcome")}
            >
              <ArrowLeft size={14} />
              Back
            </Button>
          )}
        </div>
      </header>

      {welcome ? (
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
          {/* Hero */}
          <section className="relative grid min-h-[70vh] items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
            <div className="hero-glow" />
            <div className="relative z-10 flex flex-col items-start">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                A quieter place to catch up
              </span>
              <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Less noise.
                <br />
                <span className="gradient-text">More connection.</span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                Chime is a calm, focused messaging space for the people who
                matter. No algorithms, no clutter — just clean, real-time
                conversations.
              </p>
              {unavailable ? (
                <div
                  role={configured ? "status" : "alert"}
                  className="mt-8 max-w-md rounded-2xl border border-warning/30 bg-warning/5 p-4"
                >
                  <p className="flex items-center gap-2 text-sm font-medium text-warning">
                    <WifiOff size={16} />
                    {!configured
                      ? "Sign-in unavailable"
                      : offline
                        ? "You're offline"
                        : "Connection unavailable"}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {!configured
                      ? "Sign-in is not configured yet. Please try again later."
                      : "The app is ready. Reconnect to sign in and load your conversations."}
                  </p>
                  {configured && (
                    <Button
                      variant="outline"
                      size="small"
                      className="mt-3"
                      onClick={() => window.location.reload()}
                    >
                      Try again
                    </Button>
                  )}
                </div>
              ) : (
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button size="default" onClick={() => navigate("signup")}>
                    Get started
                    <ArrowRight size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("signin")}
                  >
                    Sign in
                  </Button>
                </div>
              )}
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={13} className="text-primary" />
                  No trackers
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap size={13} className="text-primary" />
                  Real-time sync
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield size={13} className="text-primary" />
                  Private by design
                </span>
              </div>
            </div>

            {/* Hero visual: chat preview card */}
            <div className="relative z-10 hidden lg:block">
              <div className="relative mx-auto max-w-md rounded-3xl border border-border surface-glass p-5 shadow-2xl shadow-black/10">
                <div className="mb-4 flex items-center gap-3 border-b pb-4">
                  <span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-white">
                    AB
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Alex Brooks</p>
                    <p className="flex items-center gap-1.5 text-xs text-status">
                      <span className="size-1.5 rounded-full bg-status" />
                      Online now
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex">
                    <div className="max-w-[75%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm">
                      Hey! Did you see the project update?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[75%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                      Just read through it — looks great. Want to hop on a call?
                    </div>
                  </div>
                  <div className="flex">
                    <div className="max-w-[75%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm">
                      Sure! Give me five minutes to wrap up here.
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-2xl border bg-surface/60 px-3.5 py-2.5">
                  <span className="flex-1 text-sm text-muted-foreground">
                    Type a message…
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="py-12 lg:py-20">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Designed to disappear
              </h2>
              <p className="mt-3 text-muted-foreground">
                So the only thing left is the conversation.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-border bg-surface/60 p-6 transition-shadow hover:shadow-lg"
                >
                  <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary transition-transform group-hover:scale-110">
                    <Icon size={22} strokeWidth={1.8} />
                  </span>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section id="stats" className="py-12 lg:py-16">
            <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border bg-surface/50 p-8 sm:grid-cols-4">
              {STATS.map(([value, label]) => (
                <div key={value} className="text-center">
                  <p className="text-3xl font-bold gradient-text sm:text-4xl">
                    {value}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Install / Keyboard shortcuts */}
          <section
            id="install"
            className="grid gap-5 py-12 lg:grid-cols-2 lg:py-20"
          >
            <div className="rounded-3xl border border-border bg-surface/60 p-8">
              <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bell size={22} fill="currentColor" />
              </span>
              <h3 className="text-2xl font-bold tracking-tight">
                Chime, wherever you are
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Install Chime as a progressive web app. Your conversations,
                one tap away on any device.
              </p>
              <div className="mt-6">
                <InstallButton />
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-surface/60 p-8">
              <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <Keyboard size={22} />
              </span>
              <h3 className="text-2xl font-bold tracking-tight">
                Keyboard-first
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Every action has a shortcut. Move through conversations, open
                the command palette, and send messages without touching your
                mouse.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Command palette</span>
                  <kbd>Ctrl K</kbd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">New message</span>
                  <kbd>Alt N</kbd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Focus sidebar</span>
                  <kbd>Alt 1</kbd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Focus composer</span>
                  <kbd>Alt 2</kbd>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-12 lg:py-20">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 p-10 text-center lg:p-16">
              <div className="hero-glow" />
              <div className="relative z-10">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Ready to start the conversation?
                </h2>
                <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                  Join Chime and message your people in a space designed for
                  connection, not distraction.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button size="default" onClick={() => navigate("signup")}>
                    Create your account
                    <ArrowRight size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("signin")}
                  >
                    Sign in
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <footer className="flex flex-wrap justify-between gap-3 border-t py-8 text-xs text-muted-foreground">
            <span>Chime — messaging, reimagined.</span>
            <span>Built for the web. Private by design.</span>
          </footer>
        </div>
      ) : (
        /* Auth form */
        <div className="mx-auto my-8 flex min-h-[60vh] max-w-md flex-col justify-center sm:my-16">
          <div className="rounded-3xl border border-border surface-glass p-7 shadow-xl sm:p-9">
            <div className="mb-6">
              <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/25">
                <Bell size={26} fill="currentColor" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">
                {mode === "signin"
                  ? "Welcome back."
                  : "Make room for your people."}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to open your conversations."
                  : "Create an account to start messaging."}
              </p>
            </div>
            {mode === "signin" ? (
              <SignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                forceRedirectUrl="/"
              />
            ) : (
              <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                forceRedirectUrl="/"
              />
            )}
            <Button
              variant="ghost"
              className="mt-5 w-full text-sm"
              onClick={() => navigate(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
