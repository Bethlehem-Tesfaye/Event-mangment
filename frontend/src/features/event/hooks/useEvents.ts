import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../api/eventsApi";
import type { EventsParams } from "../types/event";
import { useMemo } from "react";

export const useEvents = (params?: EventsParams) => {
  const stableParams = useMemo(() => {
    if (!params) return undefined;
    return {
      limit: params.limit,
      offset: params.offset,
      search: params.search,
      category: params.category,
    };
  }, [params?.limit, params?.offset, params?.search, params?.category]);

  return useQuery({
    queryKey: ["events", stableParams],
    queryFn: () => fetchEvents(stableParams),
  });
};
