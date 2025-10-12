import { useState } from "react";
import SideBar from "@/features/organizer/Dashboard/components/SideBar";
import Topbar from "@/features/organizer/Dashboard/components/Topbar";
import AnalyticsEventsList from "../components/AnalyticsEventsList";

export default function Analytics() {
  const [route, setRoute] = useState("analytics");

  return (
    <div className="flex min-h-screen bg-muted">
      <SideBar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Event Analytics</h1>
          </div>

          <AnalyticsEventsList />
        </main>
      </div>
    </div>
  );
}
