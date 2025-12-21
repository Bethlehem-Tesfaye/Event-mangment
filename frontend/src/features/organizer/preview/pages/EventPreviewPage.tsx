import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import EventEditor from "../components/EventEditor";
import EventPreviewLayout from "../components/EventPreviewLayout";
export default function EventPreviewPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [route, setRoute] = useState("events");

  return (
    <EventPreviewLayout route={route} setRoute={setRoute}>
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 space-y-10 flex-1p-6 flex-1">
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
