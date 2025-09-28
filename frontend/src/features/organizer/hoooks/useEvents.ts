import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { OrganizerEvent, Analytics } from "../types/organizer";


export function useOrganizerEvents() {
  return useQuery({
    queryKey: ["organizer-events"],
    queryFn: async () => {
      const res = await api.get<{ data: OrganizerEvent[] }>("/organizer/events");
      return res.data.data;
    },
  });
}

export function useOrganizerEvent(eventId: number) {
  return useQuery({
    queryKey: ["organizer-event", eventId],
    queryFn: async () => {
      const res = await api.get<{ data: OrganizerEvent }>(`/organizer/events/${eventId}`);
      return res.data.data;
    },
    enabled: !!eventId,
  });
}

export function useEventAnalytics(eventId: number) {
  return useQuery({
    queryKey: ["event-analytics", eventId],
    queryFn: async () => {
      const res = await api.get<{ data: Analytics }>(`/organizer/events/${eventId}/analytics`);
      return res.data.data;
    },
    enabled: !!eventId,
  });
}

export function useOrganizerDashboardStats() {
  return useQuery({
    queryKey: ["organizer-dashboard-stats"],
    queryFn: async () => {
      const res = await api.get<{ data: { totalRevenue: number; totalTicketsSold: number; totalEvents: number } }>("/organizer/events/stats");
      return res.data.data;
    },
  });
}



// TICKETS
export function useCreateTicket(eventId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketData: { type: string; price: number; totalQuantity: number; maxPerUser: number }) => {
      const res = await api.post(`/organizer/events/${eventId}/tickets`, ticketData);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries(["organizer-event", eventId])
  });
}

export function useUpdateTicket(eventId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, data }: { ticketId: number; data: any }) => {
      const res = await api.put(`/organizer/events/${eventId}/tickets/${ticketId}`, data);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries(["organizer-event", eventId])
  });
}

export function useDeleteTicket(eventId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: number) => {
      const res = await api.delete(`/organizer/events/${eventId}/tickets/${ticketId}`);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries(["organizer-event", eventId])
  });
}

// SPEAKERS
export function useCreateSpeaker(eventId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (speakerData: { name: string; bio?: string; photoUrl?: string }) => {
      const res = await api.post(`/organizer/events/${eventId}/speakers`, speakerData);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries(["organizer-event", eventId])
  });
}

export function useUpdateSpeaker(eventId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ speakerId, data }: { speakerId: number; data: any }) => {
      const res = await api.put(`/organizer/events/${eventId}/speakers/${speakerId}`, data);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries(["organizer-event", eventId])
  });
}

export function useDeleteSpeaker(eventId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (speakerId: number) => {
      const res = await api.delete(`/organizer/events/${eventId}/speakers/${speakerId}`);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries(["organizer-event", eventId])
  });
}
