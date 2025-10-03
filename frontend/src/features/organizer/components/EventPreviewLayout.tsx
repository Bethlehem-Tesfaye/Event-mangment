import React from "react";
import Sidebar from "./SideBar";
import Topbar from "./Topbar";

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