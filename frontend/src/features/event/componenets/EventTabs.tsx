import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";
import type { EventTabsProps } from "../types/event";

export default function EventTabs({
  event,
  speakers,
  loading,
}: EventTabsProps) {
  return (
    <Tabs defaultValue="about" className="w-full">
      <TabsList className="w-full justify-start gap-2 bg-transparent p-0 border-b border-slate-200 dark:border-slate-800">
        <TabsTrigger
          value="about"
          className="rounded-full px-4 py-2 text-xs sm:text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900"
        >
          About
        </TabsTrigger>
        <TabsTrigger
          value="speakers"
          className="rounded-full px-4 py-2 text-xs sm:text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900"
        >
          Speakers
        </TabsTrigger>
        <TabsTrigger
          value="organizer"
          className="rounded-full px-4 py-2 text-xs sm:text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900"
        >
          Organizer
        </TabsTrigger>
      </TabsList>

      {/* About */}
      <TabsContent
        value="about"
        className="mt-4 rounded-2xl border border-slate-100 bg-white p-6 space-y-4 dark:border-slate-800 dark:bg-[#1b1c22]"
      >
        {event.description && (
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {event.description}
          </p>
        )}

        <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-400 sm:grid-cols-2">
          {event.startDatetime && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                Start: {format(new Date(event.startDatetime), "PPPp")}
              </span>
            </div>
          )}
          {event.endDatetime && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>End: {format(new Date(event.endDatetime), "PPPp")}</span>
            </div>
          )}
          {event.duration != null && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Duration: {event.duration} minutes</span>
            </div>
          )}
          {event.locationType && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Location type: {event.locationType}</span>
            </div>
          )}
        </div>

        {event.eventCategories && event.eventCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {event.eventCategories.map((ec) => (
              <span
                key={ec.category.id}
                className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {ec.category.name}
              </span>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Speakers */}
      <TabsContent
        value="speakers"
        className="mt-4 rounded-2xl border border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-[#1b1c22]"
      >
        {loading ? (
          <Skeleton className="w-full h-20" />
        ) : speakers.length > 0 ? (
          <ul className="space-y-4">
            {speakers.map((sp) => (
              <li
                key={sp.id}
                className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40"
              >
                {sp.photoUrl ? (
                  <img
                    src={sp.photoUrl}
                    alt={sp.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {sp.name}
                  </p>
                  {sp.bio && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {sp.bio}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 italic">
            No speakers announced yet.
          </p>
        )}
      </TabsContent>

      {/* Organizer */}
      <TabsContent
        value="organizer"
        className="mt-4 rounded-2xl border border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-[#1b1c22]"
      >
        {event.user ? (
          <div className="flex items-center gap-4">
            <img
              src={
                event.user.profile?.picture ||
                event.user.image ||
                "https://www.gravatar.com/avatar/?d=mp&s=120"
              }
              alt="Organizer"
              className="w-14 h-14 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {event.user.profile
                  ? `${event.user.profile.firstName ?? ""} ${
                      event.user.profile.lastName ?? ""
                    }`.trim()
                  : event.user.name}
              </h3>
              {event.user.email && (
                <p className="text-xs text-slate-600 mt-1 dark:text-slate-400">
                  {event.user.email}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">
            No organizer details available.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
