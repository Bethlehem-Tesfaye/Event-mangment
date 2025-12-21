import { useState } from "react";
import SideBar from "@/features/organizer/Dashboard/components/SideBar";
import Topbar from "@/features/organizer/Dashboard/components/Topbar";
import AnalyticsEventsList from "../components/AnalyticsEventsList";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export default function Analytics() {
  const [route, setRoute] = useState("analytics");
  const { user } = useCurrentUser();

  return (
    <div className="flex min-h-screen md:pl-56 dark:bg-[#050505]  bg-gray-50">
      <SideBar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col">
        <Topbar user={user} />
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 space-y-10 p-6 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Event Analytics</h1>
          </div>

          <AnalyticsEventsList />
        </main>
      </div>
    </div>
  );
}
