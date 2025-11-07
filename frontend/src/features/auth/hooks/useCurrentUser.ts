import { authClient } from "@/lib/authClient";

export const useCurrentUser = () => {
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user ?? null;

  return { user, isPending };
};
