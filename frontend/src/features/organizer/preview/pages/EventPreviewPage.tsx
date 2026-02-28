import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import EventEdit from "../components/EventEdit";
import EventPreviewLayout from "../components/EventPreviewLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventAttendees } from "@/features/organizer/attendees/hooks/useAttendees";
import { useEventAnalytics } from "@/features/organizer/analytics/hooks/useAnalytics";
import { api } from "@/lib/axios";

function EventAnalyticsView({ eventId }: { eventId?: string }) {
  const { data, isLoading, error } = useEventAnalytics(eventId);

  if (isLoading)
    return (
      <Card className="p-4 rounded-2xl">
        {" "}
        <Skeleton className="h-8 w-3/4" />{" "}
      </Card>
    );
  if (error)
    return (
      <Card className="p-4 rounded-2xl">
        <p className="text-red-500">Failed to load analytics.</p>
      </Card>
    );
  if (!data)
    return (
      <Card className="p-4 rounded-2xl">
        <p className="text-neutral-500">No analytics available.</p>
      </Card>
    );

  return (
    <Card className="p-4 rounded-2xl">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Analytics</h2>
        <p className="text-sm text-neutral-500">
          Total revenue: <strong>${data.totalRevenue?.toFixed(2) ?? 0}</strong>
        </p>
        <p className="text-sm text-neutral-500">
          Total tickets sold: <strong>{data.totalTicketsSold ?? 0}</strong>
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">By ticket</h3>
        {!data.tickets || data.tickets.length === 0 ? (
          <p className="text-neutral-500">No ticket analytics available.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-400">
                <th className="pb-2">Ticket</th>
                <th className="pb-2">Sold</th>
                <th className="pb-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.tickets.map((t: any) => (
                <tr
                  key={t.ticket_type}
                  className="border-t border-neutral-200 dark:border-neutral-700"
                >
                  <td className="py-2">{t.ticket_type}</td>
                  <td className="py-2">{t.tickets_sold}</td>
                  <td className="py-2">${(t.revenue ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
export default function EventPreviewPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [route, setRoute] = useState("events");
  const [view, setView] = useState<"preview" | "attendees" | "analytics">(
    "preview",
  );
  const { data, isLoading, error } = useEventAttendees(eventId ?? undefined);

  const downloadCsv = async () => {
    if (!eventId) return;
    const res = await api.get(
      `/organizer/events/${eventId}/attendees?format=csv`,
      {
        responseType: "blob",
      },
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
          <nav className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => setView("preview")}
              className={`relative pb-3 text-lg font-semibold transition-colors ${
                view === "preview"
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              Event
              {view === "preview" && (
                <span className="absolute -bottom-1 left-0 w-14 h-1 bg-red-500 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setView("attendees")}
              className={`relative pb-3 text-lg font-semibold transition-colors ${
                view === "attendees"
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              Attendees
              {view === "attendees" && (
                <span className="absolute -bottom-1 left-0 w-14 h-1 bg-red-500 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setView("analytics")}
              className={`relative pb-3 text-lg font-semibold transition-colors ${
                view === "analytics"
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              Analytics
              {view === "analytics" && (
                <span className="absolute -bottom-1 left-0 w-14 h-1 bg-red-500 rounded-full" />
              )}
            </button>
          </nav>
        </div>

        {view === "preview" ? (
          eventId ? (
            <EventEdit id={eventId} />
          ) : (
            <Card className="p-4 rounded-2xl">
              <p className="text-red-500">Invalid event id.</p>
            </Card>
          )
        ) : view === "attendees" ? (
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
        ) : view === "analytics" ? (
          eventId ? (
            <EventAnalyticsView eventId={eventId} />
          ) : (
            <Card className="p-4 rounded-2xl">
              <p className="text-red-500">Invalid event id.</p>
            </Card>
          )
        ) : null}
      </main>
    </EventPreviewLayout>
  );
}
