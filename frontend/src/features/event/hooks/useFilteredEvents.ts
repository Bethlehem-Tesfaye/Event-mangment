// src/features/event/hooks/useFilteredEvents.ts
import { useMemo } from "react";
import { useEvents } from "./useEvents";
import type { EventsParams } from "../types/event";

export const useFilteredEvents = (
  category?: string | null,
  page: number = 1,
  limit: number = 20,
  search?: string
) => {
  const currentPage = Math.max(1, page);
  const numericLimit = Math.max(1, limit);
  const offset = (currentPage - 1) * numericLimit;

  const params: EventsParams = useMemo(() => {
    return {
      ...(category && category !== "All" ? { category } : {}),
      ...(search ? { search } : {}),
      offset,
      limit: numericLimit,
    };
  }, [category, offset, numericLimit, search]);

  const { data, isLoading, isFetching } = useEvents(params);

  const eventsList = Array.isArray(data?.data) ? data.data : [];
  const totalCount = typeof data?.totalCount === "number" ? data.totalCount : 0;

  return { events: eventsList, totalCount, isLoading: isLoading || isFetching };
};
