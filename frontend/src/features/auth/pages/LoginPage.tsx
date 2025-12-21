import { AuthLayout } from "../components/AuthLayout";
import { LoginForm } from "../components/LoginForm";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin"; // updated hook
import { useCurrentUser } from "../hooks/useCurrentUser"; // Better Auth session hook
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin"; // updated hook
import { useCurrentUser } from "../hooks/useCurrentUser"; // Better Auth session hook
import PulseLoader from "@/components/custom/PulseLoader";
import { toast } from "sonner";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import PageContainer from "@/components/PageContainer";

export function LoginPage() {
  export function LoginPage() {
    const { login, isLoading } = useLogin();
    const { user, isPending } = useCurrentUser(); // use Better Auth session
    const navigate = useNavigate();
    const location = useLocation();
    const googleAuth = useGoogleAuth();

    const from = (location.state as any)?.from?.pathname ?? "/";

    // Redirect if already logged in
    useEffect(() => {
      if (user) {
        navigate(from, { replace: true });
      }
    }, [user, navigate, from]);
    const { user, isPending } = useCurrentUser(); // use Better Auth session
    const navigate = useNavigate();
    const location = useLocation();
    const googleAuth = useGoogleAuth();

    const from = (location.state as any)?.from?.pathname ?? "/";

    // Redirect if already logged in
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
        googleAuth();
      } else {
        toast.info(`${provider} login coming soon`);
      }
    };

    const handleSocialClick = (provider: string) => {
      if (provider === "Google") {
        googleAuth();
      } else {
        toast.info(`${provider} login coming soon`);
      }
    };

    return (
      <PageContainer>
        <AuthLayout title="Login to your account">
          <LoginForm
            onSubmit={handleSubmit}
            onSocialClick={handleSocialClick}
            onRegister={() => navigate("/register")}
            isLoading={isLoading || isPending} // show loader while session is pending
          />
          {(isLoading || isPending) && <PulseLoader show />}
        </AuthLayout>
      </PageContainer>
    );
  }
}
