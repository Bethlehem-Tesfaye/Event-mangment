import { useOrganizerEvents } from "@/features/organizer/Dashboard/hooks/useEvents";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export default function AnalyticsEventsList() {
  const { data: events, isLoading, error } = useOrganizerEvents("all");
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 rounded-2xl">
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-4 w-1/3" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) return <p className="text-red-500">Failed to load events.</p>;

  if (!events?.length)
    return <p className="text-neutral-500 text-center py-12">No events yet.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((ev: any) => (
        <Card
          key={ev.id}
          className="cursor-pointer hover:shadow-lg transition rounded-2xl"
          onClick={() => {
            const idToUse = ev.id ?? ev.uuid ?? ev.eventId ?? ev.event_id;
            navigate(`/organizer/events/${idToUse}/analytics`);
          }}
        >
          <CardHeader>
            <CardTitle className="text-xl truncate">{ev.title}</CardTitle>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {ev.eventCategories?.map((c: any) => c.category?.name).join(", ")}
            </p>
          </CardHeader>

          <CardContent className="flex items-center justify-between pt-4">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              View analytics →
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
