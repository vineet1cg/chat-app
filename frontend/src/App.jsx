import { lazy, Suspense, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@clerk/react";
import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import { Brand, Button, ErrorNotice, Spinner } from "./components/ui";

const NewConversation = lazy(() =>
  import("./components/Dialogs").then((m) => ({ default: m.NewConversation })),
);
const Settings = lazy(() =>
  import("./components/Dialogs").then((m) => ({ default: m.Settings })),
);
import { PwaUpdates } from "./components/Pwa";
import { serverUrl, setTokenProvider } from "./lib/api";
import { useChat } from "./stores/chat";
import { useEffectiveTheme } from "./lib/useEffectiveTheme";
import { WorkspaceShell } from "./components/Workspace";

export function Appearance({ children }) {
  const theme = useEffectiveTheme();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0b0b0e" : "#f5f5f3");
  }, [theme]);
  return children;
}

export default function App() {
  const { isLoaded, isSignedIn, getToken, userId } = useAuth();
  const {
    profile,
    booting,
    bootError,
    networkOnline,
    initialize,
    reset,
    setNetworkOnline,
    refresh,
  } = useChat(
    useShallow(
      ({
        profile,
        booting,
        bootError,
        networkOnline,
        initialize,
        reset,
        setNetworkOnline,
        refresh,
      }) => ({
        profile,
        booting,
        bootError,
        networkOnline,
        initialize,
        reset,
        setNetworkOnline,
        refresh,
      }),
    ),
  );
  const [dialog, setDialog] = useState(null);
  const [authUnavailable, setAuthUnavailable] = useState(false);

  useEffect(() => {
    if (isLoaded) return;
    const controller = new AbortController();
    let active = true;

    const timer = setTimeout(() => {
      if (active) setAuthUnavailable(true);
    }, 12000);

    fetch(`${serverUrl}/health`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok && active) setAuthUnavailable(true);
      })
      .catch(() => {
        if (active) setAuthUnavailable(true);
      });

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [isLoaded]);

  useEffect(() => {
    setTokenProvider(getToken);
    if (isLoaded && isSignedIn) initialize();
    return () => {
      reset();
      setTokenProvider(null);
    };
  }, [isLoaded, isSignedIn, userId, getToken, initialize, reset]);

  useEffect(() => {
    const online = () => {
      setNetworkOnline(true);
      if (isSignedIn && !useChat.getState().profile) initialize();
    };
    const offline = () => setNetworkOnline(false);
    const visible = () => {
      if (!document.hidden) refresh();
    };

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    document.addEventListener("visibilitychange", visible);

    const poll = setInterval(() => {
      if (useChat.getState().connection !== "connected" && !document.hidden)
        refresh();
    }, 30000);

    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
      document.removeEventListener("visibilitychange", visible);
      clearInterval(poll);
    };
  }, [setNetworkOnline, refresh, isSignedIn, initialize]);

  if ((!networkOnline || (!isLoaded && authUnavailable)) && !profile)
    return (
      <>
        <AuthScreen
          offline={!networkOnline}
          connectionError={authUnavailable}
        />
        <PwaUpdates />
      </>
    );

  if (!isLoaded)
    return (
      <main className="relative flex min-h-dvh flex-col items-center justify-center gap-5 p-6 text-center">
        <div className="hero-glow" />
        <Brand />
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border surface-glass p-6 shadow-xl">
          <Spinner label="Making a little room for you…" />
          <p className="mt-2 text-xs text-muted-foreground">
            If this takes a while, check your connection.
          </p>
          <Button
            variant="outline"
            size="small"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>
        </div>
      </main>
    );

  if (!isSignedIn)
    return (
      <>
        <AuthScreen />
        <PwaUpdates />
      </>
    );

  if (!profile)
    return (
      <main className="relative flex min-h-dvh flex-col items-center justify-center gap-5 p-6 text-center">
        <div className="hero-glow" />
        <Brand />
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border surface-glass p-6 shadow-xl">
          {booting ? (
            <Spinner label="Getting your conversations ready…" />
          ) : (
            <ErrorNotice
              message={bootError || "Couldn't load your account."}
              onRetry={initialize}
            />
          )}
        </div>
      </main>
    );

  return (
    <>
      <WorkspaceShell
        onNew={() => setDialog("new")}
        onSettings={() => setDialog("settings")}
        conversations={
          <Sidebar
            onNew={() => setDialog("new")}
            onSettings={() => setDialog("settings")}
          />
        }
        chat={<ChatPanel onNew={() => setDialog("new")} />}
      />

      {/* Dialog Modals */}
      <Suspense fallback={null}>
        {dialog === "new" && (
          <NewConversation onClose={() => setDialog(null)} />
        )}
        {dialog === "settings" && <Settings onClose={() => setDialog(null)} />}
      </Suspense>

      <PwaUpdates />
    </>
  );
}
