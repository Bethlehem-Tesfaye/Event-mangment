import { useState } from "react";

import Sidebar from "@/features/organizer/Dashboard/components/SideBar";
import Topbar from "@/features/organizer/Dashboard/components/Topbar";
import EventCreate from "@/features/organizer/preview/components/EventCreate";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export default function CreateEventPage() {
  const [active, setActive] = useState<string>("create");
  const { user } = useCurrentUser();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#050505]  md:pl-56">
      <Sidebar active={active} onNavigate={(key: string) => setActive(key)} />
      <div className="flex-1">
        <Topbar user={user} />
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 space-y-10 flex-1 p-6">
          <EventCreate />
        </main>
      </div>
    </div>
  );
}
