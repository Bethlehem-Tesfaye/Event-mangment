import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import EventEditor from "../components/EventEditor";
import EventPreviewLayout from "../components/EventPreviewLayout";
export default function EventPreviewPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [route, setRoute] = useState("events");

  return (
    <EventPreviewLayout route={route} setRoute={setRoute}>
      <main className="p-6 flex-1">
        <div className="mb-4">
          <Link
            to="/organizer/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <EventEditor id={eventId} />
      </main>
    </EventPreviewLayout>
  );
}
