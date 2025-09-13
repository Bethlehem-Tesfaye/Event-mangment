import { useQuery } from "@tanstack/react-query";
import { fetchEventById } from "../api/eventsApi";
import type { EventResponse } from "../types/event";

export function useEvent(id: string | number) {
  return useQuery<EventResponse>({
    queryKey: ["event", id],
    queryFn: () => fetchEventById(id),
  });
}
