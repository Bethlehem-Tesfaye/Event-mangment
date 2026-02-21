import { authClient } from "@/lib/authClient";

export const useGoogleAuth = () => {
  const clientBase = import.meta.env.VITE_CLIENT_URL || window.location.origin;

  const normalizeCallback = (cb?: string) => {
    if (!cb) return `${clientBase}/browse-event`;
    if (cb.startsWith("http://") || cb.startsWith("https://")) return cb;
    if (cb.startsWith("/")) return `${clientBase}${cb}`;
    return `${clientBase}/${cb}`;
  };

  return (callbackURL?: string) =>
    authClient.signIn.social({
      provider: "google",
      callbackURL: normalizeCallback(callbackURL),
    });
};
