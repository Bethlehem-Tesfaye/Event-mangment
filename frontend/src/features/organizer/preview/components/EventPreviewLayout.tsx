import React from "react";
import Topbar from "../../Dashboard/components/Topbar";
import Sidebar from "../../Dashboard/components/SideBar";

export default function EventPreviewLayout({
  route,
  setRoute,
  children,
}: {
  route: string;
  setRoute: (r: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen ">
      <Sidebar active={route} onNavigate={setRoute} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        {children}
      </div>
    </div>
  );
}