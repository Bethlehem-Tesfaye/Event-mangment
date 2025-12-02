import { Badge } from "@/components/ui/badge";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

type EventsListProps = {
  events: any[];
  renderActions?: (ev: any) => React.ReactNode;
  onRowClick?: (ev: any) => void;
  onPublish?: (ev: any) => void;
  onDelete?: (ev: any) => void;
  setAction: boolean;
};

export default function EventsList({
  events,
  renderActions,
  onRowClick,
  onPublish,
  onDelete,
  setAction,
}: EventsListProps) {
  if (!events.length) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No events yet. Create your first one!
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto opacity-100 rounded-[6px] shadow-none">
      <table className="w-full text-sm border-separate border-spacing-y-[2px] p-4">
        <thead className="text-muted-foreground text-left bg-gray-100 ">
          <tr>
            <th className="py-2 px-4 font-medium">Event Name</th>
            <th className="py-2 px-4 font-medium">Status</th>
            <th className="py-2 px-4 font-medium">Location Type</th>
            <th className="py-2 px-4 font-medium">Event Date</th>
            {setAction && <th className="py-2 px-4 font-medium">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {events.map((event) => (
            <tr
              key={event.id}
              className="bg-white shadow-sm rounded-lg hover:bg-muted/40 transition cursor-pointer"
              onClick={() => onRowClick?.(event)}
            >
              <td className="py-4 px-4 font-medium">{event.title}</td>

              <td className="py-4 px-4">
                {event.status && (
                  <Badge
                    className={`${
                      event.status === "published"
                        ? "bg-pink-100 text-[oklch(0.645_0.246_16.439)]"
                        : event.status === "draft"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-[oklch(0.645_0.246_16.439)]"
                    }`}
                  >
                    {event.status.charAt(0).toUpperCase() +
                      event.status.slice(1)}
                  </Badge>
                )}
              </td>

              {/* LocationType */}
              <td className="py-4 px-4 text-muted-foreground">
                {event.locationType === "online"
                  ? "Online"
                  : event.location || "N/A"}
              </td>

              {/* Event Date */}
              <td className="py-4 px-4 text-muted-foreground">
                {event.startDatetime
                  ? new Date(event.startDatetime).toLocaleDateString()
                  : "N/A"}
              </td>

              {/* Actions */}
              <td className="py-4 px-4">
                {renderActions ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    {renderActions(event)}
                  </div>
                ) : onPublish || onDelete ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded hover:bg-muted"
                    >
                      <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-32">
                      {event.status !== "published" && onPublish && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onPublish(event);
                          }}
                        >
                          Publish
                        </DropdownMenuItem>
                      )}

                      {event.status !== "cancelled" && onDelete && (
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(event);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
