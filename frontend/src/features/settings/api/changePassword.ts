import { api } from "@/lib/axios";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface setPasswordPayload {
  newPassword: string;
}

export const changePassword = async (
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> => {
  const { data } = await api.post("/auth/change-password", payload, {
    withCredentials: true,
  });
  return data.data;
};

export const setPassword = async (
  payload: setPasswordPayload
): Promise<ChangePasswordResponse> => {
  const { data } = await api.post("/auth/set-password", payload, {
    withCredentials: true,
  });
  return data.data;
};
