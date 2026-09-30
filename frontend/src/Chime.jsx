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
          colorPrimary: dark ? "#7dcfff" : "#075e86",
          colorBackground: dark ? "#171c28" : "#ffffff",
          colorForeground: dark ? "#d9e2f2" : "#243146",
          colorMutedForeground: dark ? "#a6b2c8" : "#53617a",
          colorInput: dark ? "#242c3d" : "#e4eaf3",
          colorInputForeground: dark ? "#d9e2f2" : "#243146",
          colorNeutral: dark ? "#d9e2f2" : "#243146",
          borderRadius: "6px",
          fontFamily: "Inter Variable, Inter, sans-serif",
        },
      }}
    >
      <App />
    </ClerkProvider>
  );
}
