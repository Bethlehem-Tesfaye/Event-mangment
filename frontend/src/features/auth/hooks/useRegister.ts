import { useMutation } from "@tanstack/react-query";
import {
  registerUser,
  type RegisterPayload,
  type RegisterResponse,
} from "../api/register";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { UseRegisterOptions } from "../types/auth";

export const useRegister = (options?: UseRegisterOptions) => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation<RegisterResponse, Error, RegisterPayload>({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast.success(`Welcome, ${data.user.email}! Your account was created.`);
      navigate("/browse-event");
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      toast.error("Registration failed, please try again.");
      options?.onError?.(error);
    },
  });

  return {
    register: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
};
