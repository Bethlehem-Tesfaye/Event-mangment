import { AuthLayout } from "../components/AuthLayout";
import { LoginForm } from "../components/LoginForm";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import PulseLoader from "@/components/custom/PulseLoader";
import { toast } from "sonner";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useLogin();

  const handleSubmit = (values: { email: string; password: string }) => {
    login(values);
  };

  return (
    <AuthLayout title="Login to your account">
      <LoginForm
        onSubmit={handleSubmit}
        onSocialClick={(provider) =>
          toast.info(`${provider} login coming soon`)
        }
        onRegister={() => navigate("/register")}
        isLoading={isLoading}
      />
      {isLoading && <PulseLoader show />}
    </AuthLayout>
  );
};
