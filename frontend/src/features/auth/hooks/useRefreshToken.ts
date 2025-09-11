import { useQuery } from "@tanstack/react-query";
import { refreshTokens, type RefreshResponse } from "../api/refreshToken";

export const useRefresh = () =>
  useQuery<RefreshResponse, Error>({
    queryKey: ["auth", "refresh"],
    queryFn: refreshTokens,
    retry: false,
  });
