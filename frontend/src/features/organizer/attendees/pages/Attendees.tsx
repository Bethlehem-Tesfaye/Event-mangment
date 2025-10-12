import { useState } from "react";
import SideBar from "@/features/organizer/Dashboard/components/SideBar";
import Topbar from "@/features/organizer/Dashboard/components/Topbar";
import AttendeesEventsList from "../components/AttendeesEventsList";

export default function Attendees() {
  const [route, setRoute] = useState("attendees");

  return (
    <div className="flex min-h-screen bg-muted">
      <SideBar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Event Attendees</h1>
          </div>

          <AttendeesEventsList />
        </main>
      </div>
    </div>
  );
}
