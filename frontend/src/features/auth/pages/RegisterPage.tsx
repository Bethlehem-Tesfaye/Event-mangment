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

  return (
    <AuthLayout title="Register your account">
      <RegisterForm
        onSubmit={handleSubmit}
        onSocialClick={(provider) =>
          toast.info(`${provider} login coming soon`)
        }
        onLogin={() => navigate("/login")}
        isLoading={isLoading}
      />
      {isLoading && <PulseLoader show />}
    </AuthLayout>
  );
};
