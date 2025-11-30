import { Link, useParams } from "react-router-dom";
import { useEventAttendees } from "@/features/organizer/attendees/hooks/useAttendees";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { api } from "@/lib/axios";
import Sidebar from "../../Dashboard/components/SideBar";
import Topbar from "../../Dashboard/components/Topbar";

export default function EventAttendeesPage() {
  const { eventId } = useParams<{ eventId?: string }>();
  const validEventId = eventId ?? undefined;

  const { data, isLoading, error } = useEventAttendees(validEventId);

  const downloadCsv = async () => {
    const res = await api.get(
      `/organizer/events/${validEventId}/attendees?format=csv`,
      { responseType: "blob" }
    );
    const blob = new Blob([res.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-${validEventId}-attendees.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  const [route, setRoute] = useState("events");

  return (
    <div className="space-y-6  min-h-screen bg-gray-50 dark:bg-[#050505]  md:pl-56">
      <Sidebar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col gap-4">
        <Topbar />
        <main className="p-6 max-w-7xl w-full mx-auto flex-1">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to={`/organizer/events?section=attendees`}
                className="text-sm text-blue-600 hover:underline"
              >
                ← Back
              </Link>
            </div>

            <Button variant="outline" onClick={downloadCsv}>
              Export CSV
            </Button>
          </header>

          {/* Table */}
          <Card className="p-4 rounded-2xl overflow-x-auto mt-10">
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : error ? (
              <p className="text-red-500">Failed to load attendees.</p>
            ) : !data || data.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">
                No attendees found.
              </p>
            ) : (
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
                  {(data || []).map((a) => (
                    <tr
                      key={`${a.email}-${a.registered_at}`}
                      className="border-t border-neutral-200 dark:border-neutral-700"
                    >
                      <td className="py-2">{a.full_name}</td>
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
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
