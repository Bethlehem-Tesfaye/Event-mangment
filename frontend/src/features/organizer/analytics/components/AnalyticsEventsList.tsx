import { useOrganizerEvents } from "@/features/organizer/Dashboard/hooks/useEvents";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsEventsList() {
  const { data: events, isLoading, error } = useOrganizerEvents("all");
  const list = events ?? [];
  const navigate = useNavigate();

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
        <Card
          key={ev.id}
          className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm cursor-pointer hover:shadow-md"
          role="button"
          tabIndex={0}
          onClick={() => {
            const idToUse = ev.id ?? ev.uuid ?? ev.eventId ?? ev.event_id;
            navigate(`/organizer/events/${idToUse}/analytics`);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              const idToUse = ev.id ?? ev.uuid ?? ev.eventId ?? ev.event_id;
              navigate(`/organizer/events/${idToUse}/analytics`);
            }
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="font-semibold text-lg">{ev.title}</div>
              <div className="text-sm text-muted-foreground">
                {ev.eventCategories
                  ?.map((c: any) => c.category?.name)
                  .join(", ") || ""}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              View analytics →
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
