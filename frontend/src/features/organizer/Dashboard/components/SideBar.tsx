import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/custom/Logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  SquarePen,
  ChartColumnIncreasing,
  ListOrdered,
  Settings,
  Calendar,
} from "lucide-react";

export default function Sidebar({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate: (key: string) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const items = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard />,
      path: "/organizer/dashboard",
    },
    {
      key: "events",
      label: "Events",
      icon: <Calendar />,
      path: "/organizer/events",
    },
    {
      key: "create",
      label: "Create event",
      icon: <SquarePen />,
      path: "/organizer/create-event",
    },
    {
      key: "analytics",
      label: "Analytics",
      icon: <ChartColumnIncreasing />,
      path: "/organizer/analytics",
    },
    {
      key: "attendees",
      label: "Attendees",
      icon: <ListOrdered />,
      path: "/organizer/attendees",
    },
    {
      key: "settings",
      label: "Settings",
      icon: <Settings />,
      path: "/organizer/settings",
    },
  ];

  const content = (
    <aside className="w-56 min-h-screen bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-4 flex items-center gap-3 border-b border-transparent dark:border-gray-800">
        <Logo />
        <div className="text-sm font-medium text-black dark:text-white">
          Organizer
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        <nav className="flex flex-col gap-1">
          {items.map((it) => {
            const isActive = active === it.key;
            return (
              <Button
                key={it.key}
                variant="ghost"
                onClick={() => {
                  onNavigate(it.key);
                  navigate(it.path);
                  setMobileOpen(false);
                }}
                className={`justify-start w-full px-3 py-2 rounded-md transition-colors text-sm
                  ${
                    isActive
                      ? "bg-gray-100 dark:bg-white/6 text-black dark:text-white font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  }
                `}
              >
                <span className="mr-3 text-current">{it.icon}</span>
                <span className="truncate">{it.label}</span>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 text-xs text-gray-600 dark:text-gray-300">
        <div>Account: You (organizer)</div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex">{content}</div>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button className="md:hidden fixed top-4 left-4 z-50">☰</Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          {content}
        </SheetContent>
      </Sheet>
    </>
  );
}
