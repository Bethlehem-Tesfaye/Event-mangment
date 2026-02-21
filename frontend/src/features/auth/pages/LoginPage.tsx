import { AuthLayout } from "../components/AuthLayout";
import { LoginForm } from "../components/LoginForm";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { useCurrentUser } from "../hooks/useCurrentUser";
import PulseLoader from "@/components/custom/PulseLoader";
import { toast } from "sonner";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

export function LoginPage() {
  const { login, isLoading } = useLogin();
  const { user, isPending } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const googleAuth = useGoogleAuth();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrlParam = searchParams.get("redirectUrl");

  const from =
    redirectUrlParam || (location.state as any)?.from?.pathname || "/";

  // ticket recovery state from OTP page
  const ticketRecoveryState = location.state as
    | { email?: string; registrationId?: number }
    | undefined;
  const registrationId = ticketRecoveryState?.registrationId;

  // Redirect if already logged in (normal behaviour)
  useEffect(() => {
    if (user && !user.isAnonymous && !registrationId) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from, registrationId]);

  // Attach ticket after successful login
  const attachTicketIfNeeded = async () => {
    if (!registrationId) {
      navigate(from, { replace: true });
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_AUTH_API_URL}/api/tickets/recover/attach`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ registrationId }),
        },
      );
      const data = await res.json().catch(() => null);

      if (res.ok && data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else if (res.ok) {
        window.location.href = `/registrations/${registrationId}`;
      } else {
        toast.error(data?.error || "Failed to attach ticket");
        navigate("/my-tickets");
      }
    } catch {
      toast.error("Network error while attaching ticket");
      navigate("/my-tickets");
    }
  };

  const handleSubmit = async (values: { email: string; password: string }) => {
    // your existing login hook should perform Better Auth sign-in
    await login(values);

    // after login completes, current user will be set; now attach if needed
    await attachTicketIfNeeded();
  };

  const handleSocialClick = async (provider: string) => {
    if (provider === "Google") {
      await googleAuth(from);
      return;
    }
    toast.info(`${provider} login coming soon`);
  };

  return (
    <AuthLayout title="Login to your account">
      <LoginForm
        onSubmit={handleSubmit}
        onSocialClick={handleSocialClick}
        onRegister={() => navigate("/register")}
        isLoading={isLoading || isPending}
      />
      {(isLoading || isPending) && <PulseLoader show />}
    </AuthLayout>
  );
}
