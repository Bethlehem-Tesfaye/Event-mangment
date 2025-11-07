import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/authClient";
export const useVerifyEmail = (token?: string | null) => {
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["verify-email", token],
    enabled: !!token,
    queryFn: async () => {
      if (!token) throw new Error("Missing verification token");
      const res = await authClient.verifyEmail({ query: { token } });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
  });

  useEffect(() => {
    if (query.isSuccess) {
      toast.success("Email verified successfully!");
      navigate("/login");
    }

    if (query.isError) {
      toast.error("Email verification failed, please try again!");
    }
  }, [query.isSuccess, query.isError, navigate]);

  return {
    ...query,
    isPending: query.isLoading,
  };
};
