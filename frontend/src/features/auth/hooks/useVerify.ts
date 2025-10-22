import { useQuery, queryOptions } from "@tanstack/react-query";
import { verifyEmail } from "../api/resendVerify";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useVerifyEmail = (token?: string | null) => {
  const navigate = useNavigate();

  const options = queryOptions({
    queryKey: ["verify", "email"],
    queryFn: () => verifyEmail(token),
    enabled: !!token,
  });

  const query = useQuery(options);

  if (query.isSuccess) {
    toast.success("Vertified email successfully!");
    setTimeout(() => {
      navigate("/login"), 20000;
    });
  }
  if (query.isError) {
    toast.error("Vertified email failed, please try again!");
  }

  return query;
};
