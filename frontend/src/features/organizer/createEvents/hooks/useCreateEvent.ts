import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type {
  Category,
  TicketInput,
  SpeakerInput,
  CreateEventInput,
} from "../types/createEvent";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get<{ data: Category[] }>("events/categories");
      return res.data.data;
    },
  });
}

export function useCreateEvent() {
  return useMutation({
    mutationFn: async (data: CreateEventInput) => {
      const res = await api.post("/organizer/events", data);
      return res.data;
    },
  });
}

export function useCreateTicket(eventId: number) {
  return useMutation({
    mutationFn: async (data: TicketInput) => {
      const res = await api.post(`/organizer/events/${eventId}/tickets`, data);
      return res.data;
    },
  });
}

export function useCreateSpeaker(eventId: number) {
  return useMutation({
    mutationFn: async (data: SpeakerInput) => {
      const res = await api.post(`/organizer/events/${eventId}/speakers`, data);
      return res.data;
    },
  });
}

export function usePublishEvent() {
  return useMutation({
    mutationFn: async ({ eventId }: { eventId: number }) => {
      // Send an empty object as the body
      const res = await api.put(`/organizer/events/${eventId}?status=published`, {});
      return res.data;
    },
  });
}

export function useDeleteSpeaker(eventId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (speakerId: number) => {
      const res = await api.delete(`/organizer/events/${eventId}/speakers/${speakerId}`);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organizer-event", eventId] })
  });
}

export function useDeleteTicket(eventId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: number) => {
      const res = await api.delete(`/organizer/events/${eventId}/tickets/${ticketId}`);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organizer-event", eventId] })
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await api.post("/events/categories", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    }
  });
}

export function useAssignCategoriesToEvent(eventId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryId: number) => {
      const res = await api.post(`/organizer/events/${eventId}/categories`, { categoryId });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-event", eventId] });
    }
  });
}

// const handleSaveCategories = async () => {
//   if (!eventId) return;
//   try {
//     await Promise.all(
//       selectedCategories.map(categoryId =>
//         assignCategories.mutateAsync(categoryId)
//       )
//     );
//     console.log("Categories saved!");
//   } catch (err) {
//     console.error("Error saving categories:", err);
//   }
// };
