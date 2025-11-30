import { useState } from "react";
import SideBar from "@/features/organizer/Dashboard/components/SideBar";
import Topbar from "@/features/organizer/Dashboard/components/Topbar";
import AttendeesEventsList from "../components/AttendeesEventsList";

export default function Attendees() {
  const [route, setRoute] = useState("attendees");

  return (
    <div className="flex min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <SideBar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 flex-1 max-w-6xl mx-auto">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Event Attendees
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Manage all attendees for your events, download CSVs, and view
              details.
            </p>
          </header>

          <AttendeesEventsList />
        </main>
      </div>
    </div>
  );
}
