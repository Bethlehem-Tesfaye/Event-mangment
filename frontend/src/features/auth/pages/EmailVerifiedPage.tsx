import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { toast } from "sonner";

export const EmailVerifiedPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await api.get(
          `/auth/verify-email?token=${encodeURIComponent(token ?? "")}`
        );
        toast.success("Email verified successfully!");
        setStatus("success");
        setTimeout(() => navigate("/login"), 9000);
      } catch (err) {
        setStatus("error");
        toast.error("Verification failed or link expired.");
      }
    };
    if (token) verifyEmail();
  }, [token, navigate]);

  if (status === "loading")
    return (
      <AuthLayout title="Verifying...">
        <p>Verifying your email...</p>
      </AuthLayout>
    );
  if (status === "error")
    return (
      <AuthLayout title="Verification failed">
        <p>Invalid or expired verification link.</p>
      </AuthLayout>
    );
  return (
    <AuthLayout title="Verified!">
      <p>Your email has been verified. Redirecting to login...</p>
    </AuthLayout>
  );
};
