import { useOrganizerEvents } from "@/features/organizer/Dashboard/hooks/useEvents";
import EventAnalyticsAccordion from "./EventAnalyticsAccordion";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsEventsList() {
  const { data: events, isLoading, error } = useOrganizerEvents("all");
  const list = events ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
          >
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/4 mt-3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Failed to load events.</div>;
  }

  if (!list.length) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No events yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {list.map((ev: any) => (
        <EventAnalyticsAccordion key={ev.id} event={ev} />
      ))}
    </div>
  );
}
