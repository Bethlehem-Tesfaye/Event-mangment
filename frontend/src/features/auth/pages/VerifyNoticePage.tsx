import { useState } from "react";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResendVerify } from "@/features/auth/hooks/useResendVerify";

export const VerifyNoticePage = () => {
  const [email, setEmail] = useState("");
  const resendMutation = useResendVerify();

  const handleResend = () => {
    if (!email) return;
    resendMutation.mutate(email);
  };

  return (
    <AuthLayout title="Verify your email">
      <div className="text-center space-y-4">
        <p>We’ve sent a verification link to your email address.</p>
        <p>Please verify your email to activate your account.</p>

        <p className="text-sm text-gray-500">
          Didn’t get the email? Enter your address and resend it:
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-3">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-64"
          />
          <Button
            onClick={handleResend}
            disabled={resendMutation.isPending || !email}
          >
            {resendMutation.isPending ? "Sending..." : "Resend"}
          </Button>
        </div>

        {resendMutation.isSuccess && (
          <p className="text-green-600 text-sm">
            Verification email has been resent successfully.
          </p>
        )}
      </div>
    </AuthLayout>
  );
};
