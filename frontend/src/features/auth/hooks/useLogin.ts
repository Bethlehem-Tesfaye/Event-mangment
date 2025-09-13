import { useMutation } from "@tanstack/react-query";
import {
  loginUser,
  type LoginPayload,
  type LoginResponse,
} from "../api/login ";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { UseLoginOptions } from "../types/auth";

export const useLogin = (options?: UseLoginOptions) => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast.success(`Welcome back, ${data.user.email}!`);
      navigate("/browse-event");
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      toast.error("Login failed, try again");
      options?.onError?.(error);
    },
  });

  return {
    login: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
};
