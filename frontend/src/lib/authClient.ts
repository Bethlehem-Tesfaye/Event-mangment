import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_API_URL + "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [anonymousClient()],
});
