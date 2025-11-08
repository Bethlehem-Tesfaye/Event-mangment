import { authClient } from "@/lib/authClient";

export const useGoogleAuth = () => {
  return () =>
    authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/browse-event`,
    });
};
