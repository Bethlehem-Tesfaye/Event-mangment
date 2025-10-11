import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import type { EventDetailsCardProps } from "../types/event";

export default function EventDetailsCard({ event }: EventDetailsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden dark:bg-gray-900">
      {event.eventBannerUrl && (
        <img
          src={event.eventBannerUrl}
          alt={event.title}
          className="w-full h-64 object-cover"
        />
      )}
      <div className="p-6 flex flex-col gap-4">
        <h1 className="text-3xl md:text-4xl font-bold dark:text-gray-200">
          {event.title}
        </h1>

        {event.startDatetime && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-500">
            <Calendar className="w-4 h-4 text-red-500" />
            <span>{format(new Date(event.startDatetime), "PPPp")}</span>
          </div>
        )}

        {event.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-500">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>{event.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
