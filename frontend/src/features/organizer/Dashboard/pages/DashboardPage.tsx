import { useState } from "react";
import Sidebar from "../components/SideBar";
import Topbar from "../components/Topbar";
import EventsList from "../components/EventsList";
import StatCard from "../components/StatCard";
import { Link } from "react-router-dom";
import {
  useOrganizerEvents,
  useOrganizerDashboardStats,
} from "../hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const [route, setRoute] = useState<string>("dashboard");
  const { user } = useAuth();

  const {
    data: events = [],
    isLoading: eventsLoading,
    error: eventsError,
  } = useOrganizerEvents();
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useOrganizerDashboardStats();

  const stats = statsData
    ? [
        {
          title: "Events",
          value: statsData.totalEvents,
          hint: "Total created",
        },
        {
          title: "Revenue",
          value: `$${statsData.totalRevenue}`,
          hint: "Total revenue",
        },
        {
          title: "Attendees",
          value: statsData.totalTicketsSold,
          hint: "Total attendees",
        },
      ]
    : [];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#050505]">
      <Sidebar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col">
        <Topbar user={user} />
        <main className="p-6 max-w-7xl w-full mx-auto flex-1">
          <StatCard stats={stats} loading={statsLoading} error={statsError} />

          <section className="bg-white dark:bg-[#0b0b0b] rounded-md p-4 mt-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-black dark:text-white">
                Your events
              </h2>
              <Link
                to="/organizer/events"
                className="text-sm text-gray-700 dark:text-gray-300 hover:underline"
              >
                See more →
              </Link>
            </div>

            {eventsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 p-4 bg-card rounded-md"
                  >
                    <div className="flex-1">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="w-40">
                      <Skeleton className="h-8 w-full rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : eventsError ? (
              <p className="text-red-500">Failed to load events.</p>
            ) : (
              <EventsList events={events} />
            )}
          </section>
        </main>

        <footer className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400 py-6">
          <p>
            Need help?{" "}
            <Link
              to="/support"
              className="text-gray-700 dark:text-gray-300 hover:underline"
            >
              Contact support
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
