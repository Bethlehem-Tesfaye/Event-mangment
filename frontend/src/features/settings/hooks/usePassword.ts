import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  changePassword,
  setPassword,
  type ChangePasswordPayload,
  type ChangePasswordResponse,
  type setPasswordPayload,
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

export function useSetPassword() {
  const qc = useQueryClient();
  const mutation = useMutation<
    ChangePasswordResponse,
    Error,
    setPasswordPayload
  >({
    mutationFn: setPassword,
    onSuccess: (data) => {
      toast.success(data?.message ?? "Password set successfully.");
      qc.setQueryData(["me"], (oldData: any) => {
        if (!oldData?.user) return oldData;
        return {
          ...oldData,
          user: {
            ...oldData.user,
            hasPassword: true,
          },
        };
      });
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Failed to set password");
    },
  });

  return {
    setPassword: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}
