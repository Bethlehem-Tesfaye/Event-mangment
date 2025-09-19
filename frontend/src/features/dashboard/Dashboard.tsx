import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "../auth/hooks/useLogout";

export default function Dashboard() {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      clearAuth();
      navigate("/login");
    } catch (err: any) {
      alert(err.message || "Logout failed");
    }
  };

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <button
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        style={{ padding: "8px 16px", marginTop: "16px" }}
      >
        {logoutMutation.isPending ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}
