import { useMutation } from "@tanstack/react-query";
import { logoutUser } from "../api/logout";

export const useLogout = () =>
  useMutation<void, Error>({
    mutationFn: logoutUser,
  });
