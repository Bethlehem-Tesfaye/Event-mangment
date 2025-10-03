import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { EventsListProps } from "../../types/organizer";
import { Badge } from "@/components/ui/badge";

export default function EventsList({ events }: EventsListProps) {
  if (!events.length) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No events yet. Create your first one!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => (
        <Card
          key={event.id}
          className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl shadow-sm hover:shadow-md transition"
        >
          {/* Banner image */}
          <div className="flex-shrink-0 w-full sm:w-40 h-28 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
            {event.eventBannerUrl ? (
              <img
                src={event.eventBannerUrl}
                alt={event.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-xs text-muted-foreground">No Banner</span>
            )}
          </div>

          {/* Event info */}
          <div className="flex-1 flex flex-col gap-2 w-full max-w-2xl mx-auto">
            <div className="font-semibold text-lg truncate">{event.title}</div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Status badge */}
              {event.status && (
                <Badge
                  variant={
                    event.status === "published"
                      ? "default"
                      : event.status === "draft"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
              )}
              {/* Category badges */}
              {event.eventCategories &&
                event.eventCategories.map((ec: any) =>
                  ec.category ? (
                    <Badge key={ec.category.id} variant="outline">
                      {ec.category.name}
                    </Badge>
                  ) : null
                )}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>
                <span className="font-medium">Event Date:</span>{" "}
                {event.startDatetime
                  ? new Date(event.startDatetime).toLocaleDateString()
                  : "N/A"}
                {event.endDatetime &&
                  ` - ${new Date(event.endDatetime).toLocaleDateString()}`}
              </span>
              <span>
                <span className="font-medium">Created:</span>{" "}
                {event.createdAt
                  ? new Date(event.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
              <span>
                <span className="font-medium">Location:</span>{" "}
                {event.locationType === "online"
                  ? "Online"
                  : event.location || "N/A"}
              </span>
            </div>
          </div>

          {/* View/Edit buttons */}
          <div className="mt-4 sm:mt-0 sm:ml-auto flex flex-col gap-2">
            <Link to={`/organizer/events/${event?.id ?? ""}`}>
              <Button size="sm">View</Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
