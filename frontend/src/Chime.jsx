import { ClerkProvider } from "@clerk/react";
import App from "./App";
import AuthScreen from "./components/AuthScreen";
import { PwaUpdates } from "./components/Pwa";
import { useEffectiveTheme } from "./lib/useEffectiveTheme";
const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
export default function Chime() {
  const dark = useEffectiveTheme() === "dark";
  if (!key)
    return (
      <>
        <AuthScreen configured={false} />
        <PwaUpdates />
      </>
    );
  return (
    <ClerkProvider
      publishableKey={key}
      localization={{
        signIn: { start: { title: "Sign in to Chime" } },
        signUp: { start: { title: "Create your Chime account" } },
      }}
      appearance={{
        variables: {
          colorPrimary: dark ? "#8b5cf6" : "#7c3aed",
          colorBackground: dark ? "#151519" : "#ffffff",
          colorForeground: dark ? "#e9e9ee" : "#1a1a1f",
          colorMutedForeground: dark ? "#81818d" : "#6b6b76",
          colorInput: dark ? "#1f1f25" : "#eeeceb",
          colorInputForeground: dark ? "#e9e9ee" : "#1a1a1f",
          colorNeutral: dark ? "#e9e9ee" : "#1a1a1f",
          borderRadius: "12px",
          fontFamily: "Inter Variable, Inter, sans-serif",
        },
      }}
    >
      <App />
    </ClerkProvider>
  );
}
