import { useQuery } from "@tanstack/react-query";
import { fetchEventById, fetchEventSpeakers, fetchEventTickets } from "../api/eventsApi";

export const useEventDetails = (id: string | number) => {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => fetchEventById(id),
  });
};

export const useEventSpeakers = (id: string | number) => {
  return useQuery({
    queryKey: ["eventSpeakers", id],
    queryFn: () => fetchEventSpeakers(id),
  });
};

export const useEventTickets = (id: string | number) => {
  return useQuery({
    queryKey: ["eventTickets", id],
    queryFn: () => fetchEventTickets(id),
  });
};
