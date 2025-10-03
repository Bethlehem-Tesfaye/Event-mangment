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

export interface Category {
  id: number;
  name: string;
}

export interface EventCategory {
  id: number;
  category: Category;
}

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

export interface OrganizerSummary {
  id: number;
  title: string;
  status: "draft" | "published" | "cancelled";
  startDatetime?: string;
  endDatetime?: string;
  attendees?: number;
  revenue?: number;
  banner?: string;
  eventBannerUrl?: string;
  createdAt?: string;
  location?: string;
  locationType?: string;
  description?: string;
  eventCategories?: EventCategory[];
}

export interface EventsListProps {
  events: OrganizerSummary[];
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
