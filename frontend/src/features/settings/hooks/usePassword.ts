import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  changePassword,
  type ChangePasswordPayload,
  type ChangePasswordResponse,
} from "../api/changePassword";

export function usePassword() {
  const mutation = useMutation<
    ChangePasswordResponse,
    Error,
    ChangePasswordPayload
  >({
    mutationFn: changePassword,
    onSuccess: (data) => {
      toast.success(data?.message ?? "Password changed successfully.");
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Failed to change password");
    },
  });

  return {
    changePassword: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}
