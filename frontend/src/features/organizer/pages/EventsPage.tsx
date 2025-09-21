// organizer/pages/EventsPage.tsx
import React from "react";
import EventsList from "../components/EventsList";
import type { Event } from "../components/EventCard";

export default function EventsPage({
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
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Events</h2>
      <EventsList
        events={events}
        onEdit={onEdit}
        onPublish={onPublish}
        onDelete={onDelete}
      />
    </div>
  );
}
