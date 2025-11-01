import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export type EventAnalytics = {
  totalRevenue: number;
  totalTicketsSold: number;
  tickets: Array<{
    ticket_type: string;
    tickets_sold: number;
    revenue: number;
  }>;
};

export function useEventAnalytics(eventId?: number) {
  return useQuery<EventAnalytics, Error>({
    queryKey: ["event-analytics", eventId],
    queryFn: async () => {
      const res = await api.get<{ data: EventAnalytics }>(
        `/organizer/events/${eventId}/analytics`
      );
      return res.data.data;
    },
    enabled: !!eventId,
  });
}
