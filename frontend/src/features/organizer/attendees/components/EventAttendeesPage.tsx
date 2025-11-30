import { useEventAttendees } from "@/features/organizer/attendees/hooks/useAttendees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { api } from "@/lib/axios";
import { Search } from "lucide-react";
import Sidebar from "../../Dashboard/components/SideBar";
import Topbar from "../../Dashboard/components/Topbar";

export default function EventAttendeesPage() {
  const { eventId } = useParams();
  const parsedEventId = eventId ? parseInt(eventId, 10) : undefined;
  const validEventId =
    typeof parsedEventId === "number" && !Number.isNaN(parsedEventId)
      ? parsedEventId
      : undefined;
  const { data, isLoading, error } = useEventAttendees(validEventId);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((a) =>
      `${a.full_name} ${a.email}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  const downloadCsv = async () => {
    const res = await api.get(
      `/organizer/events/${eventId}/attendees?format=csv`,
      { responseType: "blob", withCredentials: true }
    );
    const blob = new Blob([res.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-${eventId}-attendees.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  const [route, setRoute] = useState("events");

  return (
    <div className="space-y-6  md:pl-56 p-6 mx-auto">
      <Sidebar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col gap-4">
        <Topbar />
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Event Attendees</h1>
          <Button variant="outline" onClick={downloadCsv}>
            Export CSV
          </Button>
        </header>

        {/* Search */}
        <Card className="p-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-500" />
          <Input
            placeholder="Search attendees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
        </Card>

        {/* Table */}
        <Card className="p-4 rounded-2xl overflow-x-auto">
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : error ? (
            <p className="text-red-500">Failed to load attendees.</p>
          ) : !filtered.length ? (
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
                {filtered.map((a) => (
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
      </div>
    </div>
  );
}
