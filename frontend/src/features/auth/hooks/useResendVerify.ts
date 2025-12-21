import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/authClient";
import { toast } from "sonner";

type ResendVars = { email: string; callbackURL?: string };

export const useResendVerify = () =>
  useMutation<void, any, ResendVars>({
    mutationFn: async ({ email, callbackURL }: ResendVars) => {
      const res = await authClient.sendVerificationEmail({
        email,
        callbackURL,
      });
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      toast.success("Verification email resent successfully!");
    },
    onError: (err: any) => {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        "Failed to resend verification email.";
      toast.error(String(msg));
    },
  });
