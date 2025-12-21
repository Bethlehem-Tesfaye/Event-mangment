import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useResendVerify } from "@/features/auth/hooks/useResendVerify";
import { useEffect, useRef } from "react";

export const ProtectedLayout: React.FC = () => {
  const { user } = useCurrentUser();
  const location = useLocation();
  const resendMutation = useResendVerify();
  const hasSentOnce = useRef(false);

  useEffect(() => {
    if (user && !user.emailVerified && !hasSentOnce.current) {
      resendMutation.mutate({
        email: user.email,
        callbackURL: `${import.meta.env.VITE_CLIENT_URL}/browse-event`,
      });
      hasSentOnce.current = true;
    }
  }, [user, resendMutation]);

  if (user === undefined) return null; // still loading

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/verify-notice" replace />;
  }

  return <Outlet />;
};
