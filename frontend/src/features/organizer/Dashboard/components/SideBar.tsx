import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LayoutDashboard, Settings, Calendar } from "lucide-react";

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
      key: "settings",
      label: "Settings",
      icon: <Settings />,
      path: "/organizer/settings",
    },
  ];

  const content = (
    <aside className="w-56 h-full bg-white dark:bg-black flex flex-col">
      <div className="p-4 flex items-center gap-2 h-12 mt-1">
        {/* <Logo /> */}
        <span className="text-base font-semibold leading-none text-black dark:text-white">
          Organizer
        </span>
      </div>

      <ScrollArea className="flex-1 p-3">
        <nav className="flex flex-col gap-1 cursor-pointer">
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
                className={`justify-start w-full px-3 py-2 rounded-md transition-colors cursor-pointer text-sm
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
      {/* Desktop fixed sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 h-screen z-40">
        {content}
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button className="md:hidden fixed top-4 left-4 z-50">☰</Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 md:hidden">
          {content}
        </SheetContent>
      </Sheet>
    </>
  );
}
