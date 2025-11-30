import React from "react";
import Topbar from "../../Dashboard/components/Topbar";
import Sidebar from "../../Dashboard/components/SideBar";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export default function EventPreviewLayout({
  route,
  setRoute,
  children,
}: {
  route: string;
  setRoute: (r: string) => void;
  children: React.ReactNode;
}) {
  const { user } = useCurrentUser();

  return (
    <div className="flex min-h-screen  bg-gray-50 dark:bg-[#050505]  md:pl-56 ">
      <Sidebar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col">
        <Topbar user={user} />
        {children}
      </div>
    </div>
  );
}
