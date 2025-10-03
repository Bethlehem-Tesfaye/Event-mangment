// types/organizer.ts
export interface Ticket {
  id: number | string;
  type: string;
  price: number;
  totalQuantity: number;
  remainingQuantity?: number;
  maxPerUser?: number;
  isTemp?: boolean;
}

export interface Speaker {
  id: number | string;
  name: string;
  bio?: string;
  photoUrl?: string;
  isTemp?: boolean;
}

/** Full event shape used in organizer pages */
export interface OrganizerEvent {
  id: number;
  title: string;
  status: "draft" | "published" | "cancelled";
  banner?: string;
  startDatetime?: string;
  endDatetime?: string;
  description?: string;
  location?: string;
  tickets?: Ticket[];
  speakers?: Speaker[];
  [key: string]: any;
}

/** Summary row used in lists (avoid colliding with DOM Event) */
export interface OrganizerSummary {
  id: number;
  title: string;
  status: "draft" | "published" | "cancelled";
  startDatetime?: string;
  endDatetime?: string;
  attendees?: number;
  revenue?: number;
  banner?: string;
}

export interface EventsListProps {
  events: OrganizerSummary[];
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
