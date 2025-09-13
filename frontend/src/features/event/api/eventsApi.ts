import { api } from "@/lib/axios";

export const fetchEvents = async (params?: {
  limit?: number;
  offset?: number;
  search?: string;
  category?: string; 
}) => {
  const { data } = await api.get("/events", { params });
  return data;
};


export const fetchEventById = async (id: string | number) => {
  const { data } = await api.get(`/events/${id}`);
  return data.event; // ✅ now it returns just the event
};
export const fetchEventSpeakers = async (id: string | number) => {
  const { data } = await api.get(`/events/${id}/speakers`);
  return data.data; // array of speakers
};

export const fetchEventTickets = async (id: string | number) => {
  const { data } = await api.get(`/events/${id}/tickets`);
  return data.data; // array of tickets
};
export const fetchCategories = async () => {
  const { data } = await api.get("/events/categories");
  return data?.data || [];
};
