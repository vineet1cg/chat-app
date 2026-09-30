import { SignIn, SignUp } from "@clerk/react";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Columns2,
  Command,
  FileImage,
  Keyboard,
  Terminal,
  WifiOff,
} from "lucide-react";
import { Brand, Button, ThemeMenu } from "./ui";
import { Tile } from "./Workspace";
import { InstallButton } from "./Pwa";
import { useEffectiveTheme } from "../lib/useEffectiveTheme";

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
  const theme = useEffectiveTheme();
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
          : "Chime — Conversations, tiled.";
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
    <main className="min-h-dvh bg-background p-3 sm:p-5 lg:p-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="surface-blur flex min-h-14 items-center justify-between gap-3 rounded-lg border px-3 sm:px-5">
          <Brand small />
          <nav
            aria-label="Landing navigation"
            className="hidden items-center gap-5 font-mono text-[11px] text-muted-foreground md:flex"
          >
            <span className="text-primary">01 / welcome</span>
            <a
              href="#workspace"
              className="hover:text-primary"
              onClick={() => {
                if (!welcome) navigate("welcome");
              }}
            >
              workspace
            </a>
            <a
              href="#keybindings"
              className="hover:text-primary"
              onClick={() => {
                if (!welcome) navigate("welcome");
              }}
            >
              keybindings
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden font-mono text-[10px] text-secondary sm:block">
              arch / hyprland edition
            </span>
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
          <>
            <div
              id="workspace"
              className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]"
            >
              <Tile
                title="welcome"
                index="01"
                hint="chime.desktop"
                className="border-primary/50"
              >
                <div className="flex min-h-[460px] flex-col justify-center p-6 sm:p-10 lg:p-14">
                  <div className="mb-7 flex items-center gap-2 font-mono text-xs text-primary">
                    <Terminal size={16} />
                    <span>hello@chime ~</span>
                    <span className="ml-2 text-muted-foreground">
                      a space for your people
                    </span>
                  </div>
                  <h1 className="text-4xl font-medium leading-[1.18] tracking-[-.05em] sm:text-5xl xl:text-6xl">
                    Less noise.
                    <br />
                    <span className="text-primary">More control.</span>
                  </h1>
                  <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
                    Your conversations, tiled. A focused chat workspace with
                    clean borders, useful shortcuts, and room to make it yours.
                  </p>
                  {unavailable ? (
                    <div
                      role={configured ? "status" : "alert"}
                      className="mt-7 max-w-md rounded-md border border-warning/40 bg-warning/5 p-4"
                    >
                      <p className="flex items-center gap-2 font-mono text-sm text-warning">
                        <WifiOff size={15} />
                        {!configured
                          ? "Sign-in unavailable"
                          : offline
                            ? "You’re offline"
                            : "Connection unavailable"}
                      </p>
                      <p className="mt-2 text-xs leading-6 text-muted-foreground">
                        {!configured
                          ? "Sign-in is not available yet. Please try again later."
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
                      <Button onClick={() => navigate("signup")}>
                        Get started
                        <ArrowRight size={15} />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate("signin")}
                      >
                        Sign in
                      </Button>
                    </div>
                  )}
                  <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="size-1.5 bg-primary" />
                      keyboard first
                    </span>
                    <span>responsive tiles</span>
                    <span>light + dark</span>
                  </div>
                </div>
              </Tile>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Tile title="workspace.conf" index="02" hint="defaults">
                  <div className="p-5 font-mono text-xs leading-8 sm:p-6">
                    <p className="mb-2 text-muted-foreground">
                      # a little structure. a lot of space.
                    </p>
                    <p>
                      <span className="text-secondary">layout</span>{" "}
                      <span className="text-muted-foreground">=</span> split
                    </p>
                    <p>
                      <span className="text-secondary">theme</span>{" "}
                      <span className="text-muted-foreground">=</span> {theme}
                    </p>
                    <p>
                      <span className="text-secondary">gaps</span>{" "}
                      <span className="text-muted-foreground">=</span> 12px
                    </p>
                    <p>
                      <span className="text-secondary">active_border</span>{" "}
                      <span className="text-muted-foreground">=</span>{" "}
                      <span className="text-primary">cyan</span>
                    </p>
                    <p>
                      <span className="text-secondary">distractions</span>{" "}
                      <span className="text-muted-foreground">=</span> less
                    </p>
                    <div aria-hidden="true" className="mt-5 flex gap-2">
                      {[
                        "bg-primary",
                        "bg-secondary",
                        "bg-status",
                        "bg-warning",
                        "bg-destructive",
                      ].map((color) => (
                        <span
                          key={color}
                          className={`h-5 flex-1 rounded-sm ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </Tile>
                <Tile title="session" index="03" hint="on your terms">
                  <div className="p-5 sm:p-6">
                    <p className="mb-4 text-sm leading-6 text-muted-foreground">
                      A browser tab or a window of its own. Install Chime and
                      keep your conversations within reach.
                    </p>
                    <InstallButton compact />
                  </div>
                </Tile>
              </div>
            </div>
            <section
              aria-label="Workspace features"
              className="mt-3 grid gap-3 md:grid-cols-3"
            >
              {[
                [
                  "04",
                  Columns2,
                  "A place for everything",
                  "Resize the conversation tile. Expand the chat. Your layout stays the way you left it.",
                ],
                [
                  "05",
                  Command,
                  "Less reaching. More doing.",
                  "Find actions in the command launcher. Move between tiles without leaving your keyboard.",
                ],
                [
                  "06",
                  FileImage,
                  "Keep the context",
                  "Send a photo, add a caption, and follow the upload. Clear feedback if anything needs another try.",
                ],
              ].map(([index, Icon, title, description]) => (
                <Tile key={index} title={title} index={index}>
                  <div className="p-5">
                    <Icon
                      size={20}
                      strokeWidth={1.5}
                      className="mb-4 text-secondary"
                    />
                    <p className="text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </Tile>
              ))}
            </section>
            <section
              id="keybindings"
              className="mt-3 rounded-lg border bg-surface p-5 sm:p-6"
            >
              <div className="mb-5 flex items-center gap-2 font-mono text-xs">
                <Keyboard size={16} className="text-primary" />
                Once you’re in, make yourself at home.
              </div>
              <div className="grid gap-4 font-mono text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Ctrl / ⌘ K", "command launcher"],
                  ["Alt Shift N", "new message"],
                  ["Alt Shift 1 / 2", "focus a tile"],
                  ["Alt Shift F", "toggle focus layout"],
                ].map(([key, label]) => (
                  <div key={key} className="flex items-center gap-3">
                    <kbd>{key}</kbd>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="mx-auto my-8 max-w-md sm:my-14">
            <Tile
              title={mode === "signin" ? "session.login" : "session.create"}
              index="01"
              hint="authentication"
            >
              <div className="p-5 sm:p-7">
                <Terminal size={25} className="mb-5 text-primary" />
                <h1 className="text-xl font-medium">
                  {mode === "signin"
                    ? "Resume your session."
                    : "Make room for your people."}
                </h1>
                <p className="mb-6 mt-2 text-sm text-muted-foreground">
                  {mode === "signin"
                    ? "Sign in to open your workspace."
                    : "Create an account to start a conversation."}
                </p>
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
                  className="mt-5 w-full text-xs"
                  onClick={() =>
                    navigate(mode === "signin" ? "signup" : "signin")
                  }
                >
                  {mode === "signin"
                    ? "New here? Create an account"
                    : "Already have an account? Sign in"}
                </Button>
              </div>
            </Tile>
          </div>
        )}
        <footer className="mt-5 flex flex-wrap justify-between gap-3 px-1 pb-2 font-mono text-[10px] text-muted-foreground">
          <span>chime / conversations, tiled.</span>
          <span>Inspired by Arch & Hyprland. Built for the web.</span>
        </footer>
      </div>
    </main>
  );
}
