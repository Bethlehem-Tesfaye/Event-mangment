import { useState } from "react";
import Sidebar from "../components/SideBar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import EventsList from "../components/EventsList";
import AnalyticsPanel from "../components/AnalyticsPanel";
import EventEditorModal from "../components/EventEditorModal";
import type { Event } from "../components/EventCard";

export default function DashboardPage() {
  const [route, setRoute] = useState<string>("dashboard");
  const [editorOpen, setEditorOpen] = useState(false);

  // Mock data for events
  const sampleEvents: Event[] = [
    { id: 101, title: "React Deep Dive — Addis Edition", status: "published", startDate: "2025-10-12T10:00:00Z", endDate: "2025-10-12T16:00:00Z", attendees: 124, revenue: 2480 },
    { id: 102, title: "Design Systems Workshop", status: "draft", startDate: "2025-11-08T09:00:00Z", endDate: "2025-11-08T12:00:00Z", attendees: 0, revenue: 0 },
    { id: 103, title: "Startups & Product Market Fit", status: "published", startDate: "2025-09-30T14:00:00Z", endDate: "2025-09-30T18:00:00Z", attendees: 62, revenue: 930 },
  ];

  // Create a mock stats object
  const stats = [
    { title: "Events", value: sampleEvents.length, hint: "Total created" },
    { title: "Revenue", value: `$${sampleEvents.reduce((sum, e) => sum + e.revenue, 0)}`, hint: "Total revenue" },
    { title: "Attendees", value: sampleEvents.reduce((sum, e) => sum + e.attendees, 0), hint: "Total attendees" },
  ];

  return (
    <div className="flex min-h-screen bg-muted">
      <Sidebar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col">
        <Topbar onOpenCreate={() => setEditorOpen(true)} search="" setSearch={() => { } } />
        <main className="p-6 flex-1 space-y-6">
          <StatCard stats={stats} />
          <div>
            <div className="text-lg font-bold mb-4">Your events</div>
            <EventsList events={sampleEvents} onEdit={() => {}} onPublish={() => {}} onDelete={() => {}} />
          </div>
          <AnalyticsPanel
            totalRevenue={sampleEvents.reduce((s, e) => s + e.revenue, 0)}
            totalTickets={sampleEvents.reduce((s, e) => s + e.attendees, 0)}
          />
        </main>
      </div>

      <EventEditorModal open={editorOpen} onClose={() => setEditorOpen(false)} initial={undefined} onSave={() => {}} />
    </div>
  );
}
