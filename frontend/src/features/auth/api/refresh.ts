import { api } from "@/lib/axios";

export interface RefreshResponse {
  user: { id: string; email: string };
  accessToken: string;
}

export const refreshTokens = async (): Promise<RefreshResponse> => {
  const { data } = await api.post("/auth/refresh");
  return data.data;
};
