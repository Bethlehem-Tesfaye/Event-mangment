import { useMutation } from "@tanstack/react-query";
import { logoutUser } from "../api/logout";
import { toast } from "sonner";

export const useLogout = () =>
  useMutation<void, Error>({
    mutationFn: logoutUser,
    onSuccess: () => {
      window.location.reload();
      toast.success("Successfully logged out!");
    },
    onError: () => {
      toast.error("Logout failed, please try again");
    },
  });
