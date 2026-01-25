import { useEffect, useState } from "react";
import { authClient } from "@/lib/authClient";
import { useCurrentUser } from "./useCurrentUser";

export const AnonymousBootstrap = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, isPending } = useCurrentUser();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const bootstrapAnonymous = async () => {
      if (!user && !isPending) {
        try {
          await authClient.signIn.anonymous();
          console.log("Anonymous user created!");
        } catch (err) {
          console.error("Failed to create anonymous user", err);
        }
      }
      setBootstrapped(true);
    };

    bootstrapAnonymous();
  }, [user, isPending]);

  if (!bootstrapped || isPending) {
    // optional: a loading spinner while the anonymous user is being created
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};
