import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/custom/Logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
    { key: "dashboard", label: "Dashboard", icon: "📊", path: "/organizer/dashboard" },
    { key: "events", label: "Events", icon: "🎫", path: "/organizer/events" },
    { key: "create", label: "Create event", icon: "✍️", path: "/organizer/create-event" },
    { key: "analytics", label: "Analytics", icon: "📈", path: "/organizer/analytics" },
    { key: "attendees", label: "Attendees", icon: "🧑‍🤝‍🧑", path: "/organizer/attendees" },
    { key: "settings", label: "Settings", icon: "⚙️", path: "/organizer/settings" },
  ];

  const content = (
    <aside className="w-64 min-h-screen bg-pink-100 border-r flex flex-col">
      <div className="p-4 flex  gap-2">
        <Logo />
        <div className="text-sm text-muted-foreground mt-1">Organizer</div>
      </div>

      <ScrollArea className="flex-1 p-2">
        <nav className="flex flex-col gap-2">
          {items.map((it) => (
            <Button
              key={it.key}
              variant={active === it.key ? "secondary" : "ghost"}
              onClick={() => {
                onNavigate(it.key);
                navigate(it.path);
                setMobileOpen(false);
              }}
              className={`justify-start w-full
                ${active === it.key
                  ? "bg-red-300 text-white hover:bg-red-300"
                  : "hover:bg-red-300 hover:text-white"}
              `}
            >
              <span className="mr-3">{it.icon}</span>
              {it.label}
            </Button>
          ))}
        </nav>
      </ScrollArea>

      <div className="p-4 text-xs text-muted-foreground">
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
