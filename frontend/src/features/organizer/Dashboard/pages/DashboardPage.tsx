import { useState } from "react";
import Sidebar from "../components/SideBar";
import Topbar from "../components/Topbar";
import EventsList from "../components/EventsList";
import StatCard from "../components/StatCard";
import { Link, useNavigate } from "react-router-dom";
import {
  useOrganizerEvents,
  useOrganizerDashboardStats,
} from "../hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "../../../auth/hooks/useCurrentUser"; // new hook
import { useLogout } from "@/features/auth/hooks/useLogout";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const [route, setRoute] = useState<string>("dashboard");
  const { user } = useCurrentUser(); // replaced useAuth
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();

  const {
    data: events = [],
    isLoading: eventsLoading,
    error: eventsError,
  } = useOrganizerEvents();

  // only show up to 4 events in the dashboard preview
  const displayedEvents = events.slice(0, 4);

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useOrganizerDashboardStats();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate("/");
      },
      onError: (err) => {
        console.error("Logout failed:", err);
      },
    });
  };

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
          value: `${statsData.totalTicketsSold}`,
          hint: "Total revenue",
        },
      ]
    : [];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#050505]  md:pl-56">
      <Sidebar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col">
        <Topbar user={user} onLogout={handleLogout} />
        <main className="p-6 max-w-7xl w-full mx-auto flex-1">
          <div className="mt-[50px] mb-6">
            <p className="text-[24px] font-semibold">Overview</p>
          </div>
          <StatCard stats={stats} loading={statsLoading} error={statsError} />

          <section className="bg-white dark:bg-[#0b0b0b] rounded-md p-4 mt-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-medium text-black dark:text-white">
                  Your events
                </h2>
                <h3>Manage your created events</h3>
              </div>
              <Link
                to="/organizer/events"
                className="text-sm text-gray-700 dark:text-gray-300 hover:underline flex justify-center items-center"
              >
                See more <ArrowRight className="w-4 h-4" />
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
              <EventsList
                events={displayedEvents}
                onRowClick={(ev: any) => navigate(`/organizer/events/${ev.id}`)}
                setAction={false}
              />
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
          <p>© {new Date().getFullYear()} EventLight. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
