import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedLayout: React.FC = () => {
  const { user, accessToken } = useAuth();
  const location = useLocation();
  if (user === null && accessToken) {
    return null;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
