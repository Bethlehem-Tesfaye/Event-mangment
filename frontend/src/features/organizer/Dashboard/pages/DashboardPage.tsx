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
import { useCurrentUser } from "../../../auth/hooks/useCurrentUser";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const [route, setRoute] = useState<string>("dashboard");
  const { user } = useCurrentUser();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();

  const {
    data: events = [],
    isLoading: eventsLoading,
    error: eventsError,
  } = useOrganizerEvents();

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
              <div className="w-full overflow-x-auto opacity-100 rounded-[6px] shadow-none">
                <table className="w-full text-sm border-separate border-spacing-y-[2px] p-4">
                  <thead className="text-muted-foreground text-left">
                    <tr>
                      <th className="py-2 px-4 font-medium">Event Name</th>
                      <th className="py-2 px-4 font-medium">Status</th>
                      <th className="py-2 px-4 font-medium">Location Type</th>
                      <th className="py-2 px-4 font-medium">Event Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {[1, 2, 3, 4].map((i) => (
                      <tr
                        key={i}
                        className="bg-white dark:bg-[#202127]  shadow-sm rounded-lg transition"
                      >
                        <td className="py-4 px-4 font-medium">
                          <Skeleton className="h-5 w-48" />
                        </td>

                        <td className="py-4 px-4">
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </td>

                        <td className="py-4 px-4 text-muted-foreground">
                          <Skeleton className="h-4 w-24" />
                        </td>

                        <td className="py-4 px-4 text-muted-foreground">
                          <Skeleton className="h-4 w-28" />
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
