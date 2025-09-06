import { useMutation } from "@tanstack/react-query";
import { loginUser, type LoginPayload, type LoginResponse } from "../api/login ";

export const useLogin = () =>
  useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: loginUser,
  });
