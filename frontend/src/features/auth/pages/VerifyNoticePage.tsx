import { useState } from "react";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { useResendVerify } from "@/features/auth/hooks/useResendVerify";
import { useCurrentUser } from "../hooks/useCurrentUser";

export const VerifyNoticePage = () => {
  const { user } = useCurrentUser();
  const [email] = useState(user?.email);
  const { mutate: resend, isPending, isSuccess } = useResendVerify();

  const handleResend = () => {
    if (!email) return;
    resend({
      email,
      callbackURL: `${import.meta.env.VITE_CLIENT_URL}/browse-event`,
    });
  };

  return (
    <AuthLayout title="Verify your email">
      <div className="text-center space-y-4">
        <p>We’ve sent a verification link to your email address.</p>
        <p>Please verify your email to activate your account.</p>

        <p className="text-sm text-gray-500">Didn’t get the email?</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-3">
          <Button onClick={handleResend} disabled={isPending || !email}>
            {isPending ? "Sending..." : "Resend"}
          </Button>
        </div>

        {isSuccess && (
          <p className="text-green-600 text-sm">
            Verification email has been resent successfully.
          </p>
        )}
      </div>
    </AuthLayout>
  );
};
