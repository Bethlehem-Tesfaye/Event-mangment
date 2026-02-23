import { useQuery } from "@tanstack/react-query";
import { fetchUserTicketStatusForEvent } from "../api/eventsApi";

export const useUserTicketStatus = (
  eventId?: string | number,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["user-ticket-status", eventId],
    queryFn: () => fetchUserTicketStatusForEvent(eventId as string | number),
    enabled: !!eventId && enabled,
  });
};
