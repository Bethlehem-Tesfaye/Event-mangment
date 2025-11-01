import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useResendVerify } from "@/features/auth/hooks/useResendVerify";
import { useEffect, useRef } from "react";

export const ProtectedLayout: React.FC = () => {
  const { user, accessToken } = useAuth();
  const location = useLocation();
  const resendMutation = useResendVerify();
  const hasSentOnce = useRef(false);

  useEffect(() => {
    if (user && !user.isVerified && !hasSentOnce.current) {
      resendMutation.mutate(user.email);
      hasSentOnce.current = true;
    }
  }, [user, resendMutation]); // ✅ no pathname here

  if (user === null && accessToken) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!user.isVerified) return <Navigate to="/verify-notice" replace />;

  return <Outlet />;
};
