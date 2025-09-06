import { useState } from "react";
import { AuthLayout } from "../components/AuthLayout";
import { LoginForm } from "../components/LoginForm";
import { Navigate, useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { useAuth } from "@/context/AuthContext";
import PulseLoader from "@/components/custom/PulseLoader";
import { toast } from "sonner";

export const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const { setAuth, accessToken, user } = useAuth();

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const res = await loginMutation.mutateAsync(values);
      console.log("Logged in:", res.user);
      setAuth(res.user, res.accessToken);
      toast.success(`Welcome back, ${res.user.email}!`);
      navigate("/dashboard");
      console.log("accessToken", accessToken, "user", user);
    } catch (err: any) {
      toast.error("Login failed, try again");
    }
  };

  if (isRegister) return <Navigate to="/register" replace />;

  return (
    <AuthLayout title="Login to your account">
      <LoginForm
        onSubmit={handleSubmit}
        onSocialClick={(provider) =>
          toast.info(`${provider} login coming soon`)
        }
        toggleRegister={() => setIsRegister(true)}
        isLoading={loginMutation.isPending}
      />
      {loginMutation.isPending && <PulseLoader show />}
    </AuthLayout>
  );
};
