import { useState } from "react";
import Sidebar from "../components/SideBar";
import Topbar from "../components/Topbar";
import EventsList from "../components/EventsList";
import StatCard from "../components/StatCard";
import { Link } from "react-router-dom";
import { useOrganizerEvents, useOrganizerDashboardStats } from "../hoooks/useEvents";

export default function DashboardPage() {
  const [route, setRoute] = useState<string>("dashboard");

  const { data: events = [], isLoading: eventsLoading, error: eventsError } = useOrganizerEvents();
  const { data: statsData, isLoading: statsLoading, error: statsError } = useOrganizerDashboardStats();

  const stats = statsData
    ? [
        { title: "Events", value: statsData.totalEvents, hint: "Total created" },
        { title: "Revenue", value: `$${statsData.totalRevenue}`, hint: "Total revenue" },
        { title: "Attendees", value: statsData.totalTicketsSold, hint: "Total attendees" },
      ]
    : [];

  return (
    <div className="flex min-h-screen bg-muted">
      <Sidebar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 flex-1 space-y-16">
          {statsLoading ? (
            <p>Loading stats...</p>
          ) : statsError ? (
            <p className="text-red-500">Failed to load stats.</p>
          ) : (
            <StatCard stats={stats} />
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold">Your events</div>
              <Link to="/events" className="text-md text-primary hover:underline">
                See more →
              </Link>
            </div>

            {eventsLoading ? (
              <p>Loading events...</p>
            ) : eventsError ? (
              <p className="text-red-500">Failed to load events.</p>
            ) : (
              <EventsList
                events={events}
                onEdit={(id) => console.log("Edit event", id)}
                onPublish={(id) => console.log("Publish event", id)}
                onDelete={(id) => console.log("Delete event", id)}
              />
            )}
          </div>
        </main>

        <footer className="mt-12 text-center text-md text-muted-foreground">
          <p>
            Need help?{" "}
            <Link to="/support" className="text-primary text-md hover:underline">
              Contact support
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
