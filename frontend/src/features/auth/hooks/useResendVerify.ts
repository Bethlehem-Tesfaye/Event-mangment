import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { resendVerificationEmail } from "../api/resendVerify";

export const useResendVerify = () =>
  useMutation({
    mutationFn: (email: string) => resendVerificationEmail(email),
    onSuccess: () => toast.success("Verification email resent successfully"),
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to resend email";
      toast.error(String(msg));
    },
  });
