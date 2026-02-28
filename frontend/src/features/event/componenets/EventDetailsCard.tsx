import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import type { EventDetailsCardProps } from "../types/event";

export default function EventDetailsCard({ event }: EventDetailsCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="relative h-64 sm:h-72">
        {event.eventBannerUrl ? (
          <img
            src={event.eventBannerUrl}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-muted to-muted/40" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

        <div className="absolute left-5 right-5 bottom-5">
          <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground">
            {event.locationType || "Event"}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-6 sm:p-8">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
            {event.title}
          </h1>
          {event.description && (
            <p className="text-sm sm:text-base text-muted-foreground leading-7">
              {event.description}
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {event.startDatetime && (
            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
              <span className="mt-0.5 rounded-md bg-background p-2">
                <Calendar className="h-4 w-4 text-primary" />
              </span>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Date & time
                </p>
                <p className="text-sm font-medium leading-5">
                  {format(new Date(event.startDatetime), "PPPp")}
                </p>
              </div>
            </div>
          )}

          {event.location && (
            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
              <span className="mt-0.5 rounded-md bg-background p-2">
                <MapPin className="h-4 w-4 text-primary" />
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Venue
                </p>
                <p className="truncate text-sm font-medium">{event.location}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
