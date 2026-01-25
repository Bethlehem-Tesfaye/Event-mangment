import { authClient } from "@/lib/authClient";

export const useCurrentUser = () => {
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user ?? null;

  const isAuthenticated = !!user;
  const isAnonymous = user?.isAnonymous === true;
  const isRealUser = !!user && user.isAnonymous === false;

  return {
    user,
    isPending,
    isAuthenticated,
    isAnonymous,
    isRealUser,
  };
};
