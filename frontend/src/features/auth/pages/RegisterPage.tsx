import { AuthLayout } from "../components/AuthLayout";
import { RegisterForm } from "../components/RegisterForm";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../hooks/useRegister";
import PulseLoader from "@/components/custom/PulseLoader";
import { toast } from "sonner";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useRegister();

  const handleSubmit = async (values: { email: string; password: string }) => {
    register(values);
  };

  const handleSocialClick = (provider: string) => {
    if (provider === "Google") {
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    } else {
      toast.info(`${provider} login coming soon`);
    }
  };

  return (
    <AuthLayout title="Register your account">
      <RegisterForm
        onSubmit={handleSubmit}
        onSocialClick={handleSocialClick}
        onLogin={() => navigate("/login")}
        isLoading={isLoading}
      />
      {isLoading && <PulseLoader show />}
    </AuthLayout>
  );
};
