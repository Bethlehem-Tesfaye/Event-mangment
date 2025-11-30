import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export type Attendee = {
  full_name: string;
  email: string;
  ticket_type: string;
  registered_quantity: number;
  registered_at: string;
};

export function useEventAttendees(eventId?: string) {
  return useQuery<Attendee[], Error>({
    queryKey: ["event-attendees", eventId],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: { attendees: Attendee[] } }>(
          `/organizer/events/${eventId}/attendees`
        );
        return res.data.data.attendees;
      } catch (err: any) {
        // If server returns 404 (no attendees / not found), treat as empty list
        if (err?.response?.status === 404) return [];
        throw err;
      }
    },
    enabled: !!eventId,
  });
}
