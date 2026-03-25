import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useResendVerify } from "@/features/auth/hooks/useResendVerify";
import { useEffect, useRef } from "react";
import PulseLoader from "@/components/custom/PulseLoader";

export const ProtectedLayout: React.FC = () => {
  const { user, isPending, isAnonymous, isRealUser } = useCurrentUser();
  const location = useLocation();
  const resendMutation = useResendVerify();
  const hasSentOnce = useRef(false);

  useEffect(() => {
    if (user && isRealUser && !user.emailVerified && !hasSentOnce.current) {
      resendMutation.mutate({
        email: user.email,
        callbackURL: `${import.meta.env.VITE_CLIENT_URL}/browse-event`,
      });
      hasSentOnce.current = true;
    }
  }, [user, resendMutation]);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PulseLoader show={true} />
      </div>
    );
  }

  if (!user || isAnonymous) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isRealUser && !user?.emailVerified) {
    return <Navigate to="/verify-notice" replace />;
  }

  return <Outlet />;
};
