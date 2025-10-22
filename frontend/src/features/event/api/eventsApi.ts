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
  return data.event;
};
export const fetchEventSpeakers = async (id: string | number) => {
  const { data } = await api.get(`/events/${id}/speakers`);
  return data.data;
};

export const fetchEventTickets = async (id: string | number) => {
  const { data } = await api.get(`/events/${id}/tickets`);
  return data.data;
};
export const fetchCategories = async () => {
  const { data } = await api.get("/events/categories");
  return data?.data || [];
};
export const purchaseTicket = async (payload: {
  eventId: number | string;
  ticketId: number | string;
  attendeeName: string;
  attendeeEmail: string;
  quantity: number;
}) => {
  const { eventId, ticketId, attendeeName, attendeeEmail, quantity } = payload;

  const { data } = await api.post(
    `/events/${eventId}/tickets/purchase`,
    { ticketId, attendeeName, attendeeEmail, quantity },
    { withCredentials: true }
  );

  return data;
};

// new: fetch the authenticated user's registrations
export const fetchUserRegistrations = async () => {
  const { data } = await api.get("/users/events", { withCredentials: true });
  // returns data (controller sends { data: registrations })
  return data?.data ?? [];
};
