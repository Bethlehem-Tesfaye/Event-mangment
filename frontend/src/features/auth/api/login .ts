import { api } from "@/lib/axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: { id: string; email: string };
  accessToken: string;
}

export const loginUser = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const { data } = await api.post("/auth/login", payload);
  return data.data;
};
