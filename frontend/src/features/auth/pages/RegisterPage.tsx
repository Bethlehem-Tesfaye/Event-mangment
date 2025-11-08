import { AuthLayout } from "../components/AuthLayout";
import { RegisterForm } from "../components/RegisterForm";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../hooks/useRegister";
import PulseLoader from "@/components/custom/PulseLoader";
import { toast } from "sonner";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useRegister();
  const googleAuth = useGoogleAuth();

  const handleSubmit = async (values: {
    name: string;
    email: string;
    password: string;
    callbackURL: string;
  }) => {
    await register(values);
  };

  const handleSocialClick = (provider: string) => {
    if (provider === "Google") {
      googleAuth();
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
