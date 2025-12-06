import { api } from "@/lib/axios";

export const fetchNOtification = async () => {
  const { data } = await api.get("/notifications");
  return data.data;
};
export const readNotification = async (id: string) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data.data;
};

export const readAllNotification = async () => {
  const { data } = await api.put(`/notifications/read-all`);
  return data.data;
};
