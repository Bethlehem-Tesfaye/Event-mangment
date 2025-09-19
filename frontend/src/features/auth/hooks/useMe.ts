import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/axios";

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data.data;
    }
  });
};
