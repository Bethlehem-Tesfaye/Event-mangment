import { AuthLayout } from "../components/AuthLayout";
import { LoginForm } from "../components/LoginForm";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLogin } from "../hooks/useLogin";
import PulseLoader from "@/components/custom/PulseLoader";
import { toast } from "sonner";

export function LoginPage() {
  const { login, isLoading } = useLogin();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname ?? "/";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = (values: { email: string; password: string }) => {
    login(values);
  };

  const handleSocialClick = (provider: string) => {
    if (provider === "Google") {
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    } else {
      toast.info(`${provider} login coming soon`);
    }
  };

  return (
    <AuthLayout title="Login to your account">
      <LoginForm
        onSubmit={handleSubmit}
        onSocialClick={handleSocialClick}
        onRegister={() => navigate("/register")}
        isLoading={isLoading}
      />
      {isLoading && <PulseLoader show />}
    </AuthLayout>
  );
}
