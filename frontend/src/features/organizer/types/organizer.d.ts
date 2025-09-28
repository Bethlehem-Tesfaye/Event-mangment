// types/organizer.ts
export interface OrganizerEvent {
  id: number;
  title: string;
  status: "draft" | "published" | "cancelled";
  banner?: string;
  startDatetime: string;
  endDatetime: string;
}

export interface Event {
  id: number;
  title: string;
  status: "draft" | "published" | "cancelled";
  startDate: string;
  endDate: string;
  attendees: number;
  revenue: number;
  banner?: string;
}

export interface EventsListProps {
  events: OrganizerEvent[];
  onEdit: (id: number) => void;
  onPublish: (id: number) => void;
  onDelete: (id: number) => void;
}



export interface Analytics {
  totalRevenue: number;
  totalTicketsSold: number;
  tickets: {
    ticket_type: string;
    tickets_sold: number;
    revenue: number;
  }[];
};
