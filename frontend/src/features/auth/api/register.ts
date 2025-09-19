import { api } from "@/lib/axios";

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: { id: string; email: string };
  accessToken: string;
}

export const registerUser = async (
  payload: RegisterPayload,
): Promise<RegisterResponse> => {
  const { data } = await api.post("/auth/register", payload, {
    withCredentials: true,
  });
  return data.data;
};
