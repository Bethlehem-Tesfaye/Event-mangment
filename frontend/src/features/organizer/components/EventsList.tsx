import React from "react";
import EventCard from "./EventCard";
import type { Event } from "./EventCard";
import { Separator } from "@/components/ui/separator";

export default function EventsList({
  events,
  onEdit,
  onPublish,
  onDelete,
}: {
  events: Event[];
  onEdit: (id: number) => void;
  onPublish: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  if (!events.length)
    return <div className="p-6 text-center text-muted-foreground">No events yet. Create your first event.</div>;

  return (
    <div className="flex flex-col gap-2 md:gap-6 md:w-[450px] w-[300px]">
      {events.map((ev) => (
        <div key={ev.id} className="w-full md:w-auto">
          <EventCard
            e={ev}
            onEdit={onEdit}
            onPublish={onPublish}
            onDelete={onDelete}
          />
          <Separator className="my-2 md:hidden" /> {/* optional separator for mobile only */}
        </div>
      ))}
    </div>
  );
}
