import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useResendVerify } from "@/features/auth/hooks/useResendVerify";
import { useEffect } from "react";

export const ProtectedLayout: React.FC = () => {
  const { user, accessToken } = useAuth();
  const location = useLocation();
  const resendMutation = useResendVerify();

  useEffect(() => {
    if (user && !user.isVerified) {
      resendMutation.mutate(user.email);
    }
  }, [user, location.pathname, resendMutation]);

  if (user === null && accessToken) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!user.isVerified) {
    return <Navigate to={`/verify-notice`} replace />;
  }

  return <Outlet />;
};
