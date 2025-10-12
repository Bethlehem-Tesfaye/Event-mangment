import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export type Attendee = {
  full_name: string;
  email: string;
  ticket_type: string;
  registered_quantity: number;
  registered_at: string;
};

export function useEventAttendees(eventId?: number) {
  return useQuery<Attendee[], Error>({
    queryKey: ["event-attendees", eventId],
    queryFn: async () => {
      const res = await api.get<{ data: { attendees: Attendee[] } }>(
        `/organizer/events/${eventId}/attendees`,
        { withCredentials: true }
      );
      return res.data.data.attendees;
    },
    enabled: !!eventId,
  });
}
