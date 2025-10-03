import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import type { EventsListProps } from "../types/organizer";

export default function EventsList({ events }: EventsListProps) {
  if (!events.length) {
    return <div className="text-muted-foreground text-center py-8">No events yet. Create your first one!</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card
          key={event.id}
          className="flex flex-col justify-between rounded-2xl shadow-sm hover:shadow-md transition"
        >
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="font-semibold text-lg">{event.title}</div>
            <div className="text-sm text-muted-foreground">
              {event.startDatetime ? new Date(event.startDatetime).toLocaleDateString() : "N/A"} —{" "}
              {event.endDatetime ? new Date(event.endDatetime).toLocaleDateString() : "N/A"}
            </div>

            <Separator />

            <div className="flex gap-2 mt-2">
             <Link to={`/organizer/events/${event.id}`}>
  <Button size="sm">View</Button>
</Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
