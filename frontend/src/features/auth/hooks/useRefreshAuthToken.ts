import { useMutation } from "@tanstack/react-query";
import { refreshTokens} from "../api/refreshToken";

export const useRefresh = () =>
  useMutation({
    mutationFn: refreshTokens,
  });
