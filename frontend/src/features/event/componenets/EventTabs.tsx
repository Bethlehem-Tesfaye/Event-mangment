import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";
import type { EventTabsProps } from "../types/event";

export default function EventTabs({ event, speakers, loading }: EventTabsProps) {
  return (
    <Tabs defaultValue="about" className="w-full mt-6">
     <TabsList className="flex flex-wrap gap-2 bg-gray-100 rounded-lg p-1">
    <TabsTrigger value="about" className="flex-1 md:min-w-[100px] text-center py-2">
      About
    </TabsTrigger>
    <TabsTrigger value="speakers" className="flex-1 md:min-w-[100px] text-center py-2">
      Speakers
    </TabsTrigger>
    <TabsTrigger value="organizer" className="flex-1 md:min-w-[100px] text-center py-2">
      Organizer
    </TabsTrigger>
  </TabsList>

      <TabsContent value="about" className="p-6 border rounded-b-md bg-white space-y-4">
        {event.description && <p className="text-gray-700">{event.description}</p>}

        <div className="flex flex-col gap-3 text-gray-700">
          {event.startDatetime && (
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span>Start: {format(new Date(event.startDatetime), "PPPp")}</span>
            </div>
          )}
          {event.endDatetime && (
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span>End: {format(new Date(event.endDatetime), "PPPp")}</span>
            </div>
          )}
          {event.duration != null && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span>Duration: {event.duration} minutes</span>
            </div>
          )}
          {event.locationType && (
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span>Location type: {event.locationType}</span>
            </div>
          )}
        </div>

        {event.eventCategories && event.eventCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {event.eventCategories.map((ec) => (
              <span
                key={ec.category.id}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-default"
              >
                {ec.category.name}
              </span>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="speakers" className="p-4 border rounded-b-md bg-white">
        {loading ? (
          <Skeleton className="w-full h-20" />
        ) : speakers.length > 0 ? (
          <ul className="space-y-3">
            {speakers.map((sp) => (
              <li key={sp.id} className="flex items-center gap-3">
                {sp.photoUrl ? (
                  <img
                    src={sp.photoUrl}
                    alt={sp.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                )}
                <div>
                  <p className="font-medium">{sp.name}</p>
                  {sp.bio && <p className="text-sm text-gray-600">{sp.bio}</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No speakers announced yet.</p>
        )}
      </TabsContent>

      <TabsContent value="organizer" className="p-4 border rounded-b-md bg-white">
        {event.user?.profile?.firstName ? (
          <div className="mt-2">
            <h3 className="font-semibold text-lg">
              {event.user.profile.firstName} {event.user.profile.lastName}
            </h3>
            {event.user.email && (
              <p className="text-sm text-gray-600 mt-1">{event.user.email}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">No organizer details available.</p>
        )}
      </TabsContent>
    </Tabs>
  );
}
