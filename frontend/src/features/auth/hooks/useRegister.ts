import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { registerUser, type RegisterPayload, type RegisterResponse } from "../api/register";

export const useRegister = (): UseMutationResult<
  RegisterResponse,
  Error,
  RegisterPayload
> => {
  return useMutation({
    mutationFn: registerUser,
  });
};
