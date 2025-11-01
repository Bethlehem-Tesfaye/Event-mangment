import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventAttendees } from "../hooks/useAttendees";
import { api } from "@/lib/axios";

type Props = {
  event: any;
};

export default function EventAttendeesAccordion({ event }: Props) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, error } = useEventAttendees(
    open ? event.id : undefined
  );

  const downloadCsv = async () => {
    try {
      const res = await api.get(
        `/organizer/events/${event.id}/attendees?format=csv`,
        { responseType: "blob", withCredentials: true }
      );
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `event-${event.id}-attendees.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV download failed", err);
      // you can add toast here
    }
  };

  const hasNoAttendees =
    !isLoading && (!data || (Array.isArray(data) && data.length === 0));

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="font-semibold text-lg">{event.title}</div>
          <div className="text-sm text-muted-foreground">
            {event.eventCategories
              ?.map((c: any) => c.category?.name)
              .join(", ") || ""}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setOpen((s) => !s)}>
            {open ? "Hide attendees" : "Show attendees"}
          </Button>
          <Button size="sm" variant="outline" onClick={downloadCsv}>
            Download CSV
          </Button>
        </div>
      </div>

      {open && (
        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-5 w-full" />
            </div>
          ) : hasNoAttendees ? (
            <div className="text-muted-foreground">No attendees.</div>
          ) : error ? (
            <div className="text-red-500">Failed to load attendees.</div>
          ) : data && data.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Ticket</th>
                    <th className="pb-2">Quantity</th>
                    <th className="pb-2">Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((a) => (
                    <tr
                      key={`${a.email}-${a.registered_at}`}
                      className="border-t"
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
            </div>
          ) : (
            <div className="text-muted-foreground">No attendees found.</div>
          )}
        </div>
      )}
    </Card>
  );
}
