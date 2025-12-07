import { useLocation, Link, useNavigate, useParams } from "react-router-dom";
import { useOrganizerEvent } from "@/features/organizer/Dashboard/hooks/useEvents";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import EventDetailsCard from "@/features/event/componenets/EventDetailsCard";
import EventTabs from "@/features/event/componenets/EventTabs";
import TicketList from "@/features/event/componenets/TicketList";
import {
  useEventDetails,
  useEventSpeakers,
  useEventTickets,
} from "@/features/event/hooks/useEventDetails";
import { Skeleton } from "@/components/ui/skeleton";
import Sidebar from "@/features/organizer/Dashboard/components/SideBar";
import Topbar from "@/features/organizer/Dashboard/components/Topbar";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useState } from "react";

export default function OrganizerEventPreviewPage() {
  const { user } = useCurrentUser();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const [route] = useState("events");

  const loc = useLocation();
  const params = useParams();
  const q = new URLSearchParams(loc.search);
  const id = params.eventId ?? q.get("id") ?? undefined;

  const { data: publicEvent, isLoading: publicLoading } = useEventDetails(
    id ?? ""
  );
  const { data: organizerEvent, isLoading: orgLoading } = useOrganizerEvent(
    id ?? ""
  );
  const event = organizerEvent ?? publicEvent;
  const eventLoading = organizerEvent ? orgLoading : publicLoading;
  const { data: speakers, isLoading: speakersLoading } = useEventSpeakers(
    id ?? ""
  );
  const { data: tickets, isLoading: ticketsLoading } = useEventTickets(
    id ?? ""
  );

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => navigate("/"),
      onError: (err) => console.error("Logout failed:", err),
    });
  };

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium">No event selected for preview.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Pass ?id=EVENT_ID in the URL to preview an event.
          </p>
        </div>
      </div>
    );
  }

  if (eventLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#050505] md:pl-56">
        <Sidebar active={route} onNavigate={() => {}} />
        <div className="flex-1 flex flex-col">
          <Topbar user={user} onLogout={handleLogout} />
          <main className="p-6 max-w-7xl w-full mx-auto flex-1">
            <Skeleton className="h-8 w-1/3 mb-6" />
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex-1 flex flex-col gap-6">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
              <div className="w-full lg:w-80 flex flex-col gap-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#050505] md:pl-56">
        <Sidebar active="preview" onNavigate={() => {}} />
        <div className="flex-1 flex flex-col">
          <Topbar user={user} onLogout={handleLogout} />
          <main className="p-6 max-w-3xl mx-auto py-20 text-center text-muted-foreground">
            Event not found.{" "}
            <Link to="/organizer/events" className="text-red-500">
              Go back to events
            </Link>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#050505] md:pl-56">
      <Sidebar active="preview" onNavigate={() => {}} />
      <div className="flex-1 flex flex-col">
        <Topbar user={user} onLogout={handleLogout} />
        <main className="p-6 max-w-7xl w-full mx-auto flex-1">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/organizer/events/${id}`}>Your Event</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>&gt;</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{event.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 flex flex-col gap-6">
              <EventDetailsCard event={event} />
              <EventTabs
                event={event}
                speakers={speakers ?? []}
                loading={speakersLoading}
              />
            </div>

            {tickets && tickets.length > 0 && (
              <div className="w-full lg:w-80">
                <div className="bg-white dark:bg-[#0b0b0b] rounded-md p-4 shadow-sm">
                  <h3 className="text-sm font-medium mb-3">Tickets</h3>
                  <TicketList
                    tickets={tickets}
                    loading={ticketsLoading}
                    showCheckout={false}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
