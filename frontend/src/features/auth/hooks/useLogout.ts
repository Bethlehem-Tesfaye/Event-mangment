import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/authClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      const res = await authClient.signOut();
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      toast.success("Successfully logged out!");
      navigate("/");
      window.location.reload();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Logout failed, please try again.");
    },
  });
};
