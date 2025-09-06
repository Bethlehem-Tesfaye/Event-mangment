import { api } from "@/lib/axios";

export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout");
};
