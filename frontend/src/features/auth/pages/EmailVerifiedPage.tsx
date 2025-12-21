import { useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { useVerifyEmail } from "../hooks/useVerify";

export const EmailVerifiedPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { isPending, isError } = useVerifyEmail(token);

  if (isPending) {
    return (
      <AuthLayout title="Verifying...">
        <p>Verifying your email...</p>
      </AuthLayout>
    );
  }

  if (isError) {
    return (
      <AuthLayout title="Verification failed">
        <p>Invalid or expired verification link.</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Verified!">
      <p>Your email has been verified. Redirecting to login...</p>
    </AuthLayout>
  );
};
