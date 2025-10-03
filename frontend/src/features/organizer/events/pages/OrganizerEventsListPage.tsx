import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import SideBar from "../../Dashboard/components/SideBar";
import Topbar from "../../Dashboard/components/Topbar";
import { useOrganizerEvents } from "../../Dashboard/hooks/useEvents";
import EventsTabBar from "../components/EventsTabBar";
import EventsList from "../../Dashboard/components/EventsList";
import { Card } from "@/components/ui/card";
import type { EventsTabBarTab } from "../types/eventsLists";

const TABS: EventsTabBarTab[] = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
];

export default function OrganizerEventsListPage() {
  const [route, setRoute] = useState("events");
  const [tab, setTab] = useState("all");
  const { data: events = [], isLoading, error } = useOrganizerEvents(tab);

  return (
    <div className="flex min-h-screen bg-muted">
      <SideBar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 flex-1 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Your Events</h1>
          </div>
          <EventsTabBar tabs={TABS} value={tab} onChange={setTab} />
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Card
                  key={i}
                  className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl shadow-sm"
                >
                  {/* Banner skeleton */}
                  <div className="flex-shrink-0 w-full sm:w-40 h-28 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    <Skeleton className="w-full h-full" />
                  </div>
                  {/* Info skeleton */}
                  <div className="flex-1 flex flex-col gap-2 w-full max-w-2xl mx-auto">
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  {/* Button skeleton */}
                  <div className="mt-4 sm:mt-0 sm:ml-auto flex flex-col gap-2 w-20">
                    <Skeleton className="h-8 w-full rounded-md" />
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500">Failed to load events.</div>
          ) : (
            <EventsList events={events} />
          )}
        </main>
      </div>
    </div>
  );
}