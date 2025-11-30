import { useState } from "react";

import Sidebar from "@/features/organizer/Dashboard/components/SideBar";
import Topbar from "@/features/organizer/Dashboard/components/Topbar";
import { useNavigate } from "react-router-dom";
import EventEditor from "@/features/organizer/preview/components/EventEditor";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export default function CreateEventPage() {
  const [active, setActive] = useState<string>("create");
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  return (
    <div className="flex w-full dark:bg-black bg-white min-h-screen">
      <Sidebar active={active} onNavigate={(key: string) => setActive(key)} />
      <div className="flex-1">
        <Topbar user={user} />
        <main className="p-6 max-w-7xl mx-auto">
          <EventEditor
            onCreated={() => {
              navigate(`/organizer/events`);
            }}
          />
        </main>
      </div>
    </div>
  );
}
