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
    <div className="w-full overflow-x-auto opacity-100 rounded-[6px] shadow-none bg-white dark:bg-[#0b0b0b]">
      <table className="w-full text-sm border-separate border-spacing-y-[2px]">
        <thead className="text-muted-foreground text-left bg-gray-100 dark:bg-[#15161a]">
          <tr>
            <th className="py-2 px-4 font-medium text-neutral-700 dark:text-neutral-300">
              Event Name
            </th>
            <th className="py-2 px-4 font-medium text-neutral-700 dark:text-neutral-300">
              Status
            </th>
            <th className="py-2 px-4 font-medium text-neutral-700 dark:text-neutral-300">
              Location Type
            </th>
            <th className="py-2 px-4 font-medium text-neutral-700 dark:text-neutral-300">
              Event Date
            </th>
            {setAction && (
              <th className="py-2 px-4 font-medium text-neutral-700 dark:text-neutral-300">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {events.map((event) => (
            <tr
              key={event.id}
              onClick={() => onRowClick?.(event)}
              className="transition cursor-pointer
                         odd:bg-white even:bg-white/98
                         dark:odd:bg-[#121217] dark:even:bg-[#0f0f11]
                         hover:bg-muted/40 dark:hover:bg-[#202127]"
            >
              <td className="py-4 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                {event.title}
              </td>

              <td className="py-4 px-4">
                {event.status && (
                  <Badge
                    className={`${
                      event.status === "published"
                        ? "bg-pink-100 text-[oklch(0.645_0.246_16.439)]"
                        : event.status === "draft"
                        ? "bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-neutral-200"
                        : "bg-red-100 text-[oklch(0.645_0.246_16.439)]"
                    }`}
                  >
                    {event.status.charAt(0).toUpperCase() +
                      event.status.slice(1)}
                  </Badge>
                )}
              </td>

              <td className="py-4 px-4 text-neutral-700 dark:text-neutral-300">
                {event.locationType === "online"
                  ? "Online"
                  : event.location || "N/A"}
              </td>
              <td className="py-4 px-4 text-neutral-700 dark:text-neutral-300">
                {event.startDatetime
                  ? new Date(event.startDatetime).toLocaleDateString()
                  : "N/A"}
              </td>
              <td className="py-4 px-4">
                {renderActions ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    {renderActions(event)}
                  </div>
                ) : onPublish || onDelete ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded hover:bg-muted dark:hover:bg-[#202127]"
                    >
                      <MoreHorizontal className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
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
