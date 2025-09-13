import { useParams, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import EventDetailsCard from "../componenets/EventDetailsCard";
import EventTabs from "../componenets/EventTabs";
import TicketList from "../componenets/TicketList";
import { useEventDetails, useEventSpeakers, useEventTickets } from "../hooks/useEventDetails";
import { Skeleton } from "@/components/ui/skeleton";

export function EventPreview() {
  const { id } = useParams<{ id: string }>();

  const { data: event, isLoading: eventLoading } = useEventDetails(id!);
  const { data: speakers, isLoading: speakersLoading } = useEventSpeakers(id!);
  const { data: tickets, isLoading: ticketsLoading } = useEventTickets(id!);

  if (eventLoading) {
    return (
      <div className="max-w-7xl mx-auto px-16 py-10 flex flex-col gap-10">
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
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-muted-foreground">
        Event not found.{" "}
        <Link to="/browse-event" className="text-red-500">
          Go back to events
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-16 py-10 flex flex-col gap-10">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/browse-event">Events</Link>
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
            <EventTabs event={event} speakers={speakers ?? []} loading={speakersLoading} />
          </div>

          {tickets && tickets.length > 0 && (
            <div className="w-full lg:w-80">
              <TicketList tickets={tickets} loading={ticketsLoading} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
