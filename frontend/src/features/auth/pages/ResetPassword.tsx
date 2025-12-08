import React, { useState, useEffect } from "react";
import { useResetPassword } from "../hooks/useResetPassword";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const resetPassword = useResetPassword();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    setToken(tokenFromUrl);
  }, []);

  const submitting =
    (resetPassword as any).isPending || resetPassword.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Missing or invalid token.");
      return;
    }

    resetPassword.mutate(
      { newPassword, token },
      {
        onSuccess: () => {
          toast.success("Password successfully reset! Please login.");
          navigate("/login");
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.error ||
            err?.message ||
            "Failed to reset password.";
          toast.error(msg);
        },
      }
    );
  };

  return (
    <AuthLayout title="Reset Password">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 h-full justify-center"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="Enter your new password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-10"
          />
        </div>

        <div>
          <Button type="submit" className="w-full h-10" disabled={submitting}>
            {submitting ? "Resetting..." : "Reset Password"}
          </Button>
        </div>

        {resetPassword.isError && (
          <p className="text-sm text-red-600 mt-2">
            {(resetPassword.error as any)?.response?.data?.error ||
              (resetPassword.error as any)?.message ||
              "Failed to reset password."}
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
