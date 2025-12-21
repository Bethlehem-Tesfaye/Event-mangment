import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import EventEditor from "../components/EventEditor";
import EventPreviewLayout from "../components/EventPreviewLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventAttendees } from "@/features/organizer/attendees/hooks/useAttendees";
import { api } from "@/lib/axios";
export default function EventPreviewPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [route, setRoute] = useState("events");
  const [view, setView] = useState<"preview" | "attendees">("preview");
  const { data, isLoading, error } = useEventAttendees(eventId ?? undefined);

  const downloadCsv = async () => {
    if (!eventId) return;
    const res = await api.get(
      `/organizer/events/${eventId}/attendees?format=csv`,
      {
        responseType: "blob",
      }
    );
    const blob = new Blob([res.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-${eventId}-attendees.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
        <div className="mb-4">
          <nav className="flex items-center gap-4 border-b border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setView("preview")}
              className={`relative py-2 text-sm font-medium ${
                view === "preview"
                  ? "text-black dark:text-white"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              }`}
            >
              Event
              {view === "preview" && (
                <span className="absolute -bottom-[2px] left-0 right-0 h-0.5 bg-red-700 rounded" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setView("attendees")}
              className={`relative py-2 text-sm font-medium ${
                view === "attendees"
                  ? "text-black dark:text-white"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              }`}
            >
              Attendees
              {view === "attendees" && (
                <span className="absolute -bottom-[2px] left-0 right-0 h-0.5 bg-red-700 rounded" />
              )}
            </button>
          </nav>
        </div>

        {view === "preview" ? (
          <EventEditor id={eventId} />
        ) : (
          <Card className="p-4 rounded-2xl overflow-x-auto">
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : error ? (
              <p className="text-red-500">Failed to load attendees.</p>
            ) : !data || data.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">
                No attendees found.
              </p>
            ) : (
              <div>
                <div className="flex justify-end mb-3">
                  <Button variant="outline" onClick={downloadCsv}>
                    Export CSV
                  </Button>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-neutral-400">
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Email</th>
                      <th className="pb-2">Ticket</th>
                      <th className="pb-2">Qty</th>
                      <th className="pb-2">Registered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data || []).map((a: any) => (
                      <tr
                        key={`${a.email}-${a.registered_at}`}
                        className="border-t border-neutral-200 dark:border-neutral-700"
                      >
                        <td className="py-2">{a.full_name || "N/A"}</td>
                        <td className="py-2">{a.email}</td>
                        <td className="py-2">{a.ticket_type}</td>
                        <td className="py-2">{a.registered_quantity}</td>
                        <td className="py-2">
                          {new Date(a.registered_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </main>
    </EventPreviewLayout>
  );
}
