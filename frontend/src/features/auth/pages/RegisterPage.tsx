import { useState } from "react";
import { AuthLayout } from "../components/AuthLayout";
import { RegisterForm } from "../components/RegisterForm";
import { Navigate, useNavigate } from "react-router-dom";
import { useRegister } from "../hooks/useRegister";
import { useAuth } from "@/context/AuthContext";
import PulseLoader from "@/components/custom/PulseLoader";
import { toast } from "sonner";

export const RegisterPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const { setAuth } = useAuth();

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const res = await registerMutation.mutateAsync(values);
      console.log("registered:", res.user);
      setAuth(res.user, res.accessToken);
      toast.success(`Welcome, ${res.user.email}!`);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error("Registration failed, try again");
    }
  };

  if (isLogin) return <Navigate to="/" replace />;

  console.log("isPending state (render):", registerMutation.isPending);

  return (
    <AuthLayout title="Register your account">
      <RegisterForm
        onSubmit={handleSubmit}
        onSocialClick={(provider) =>
          toast.info(`${provider} login coming soon`)
        }
        toggleLogin={() => setIsLogin(true)}
        isLoading={registerMutation.isPending}
      />
      {registerMutation.isPending && <PulseLoader show />}
    </AuthLayout>
  );
};
