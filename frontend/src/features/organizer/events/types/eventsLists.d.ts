export interface Category {
  id: number;
  name: string;
}

export interface EventCategory {
  id: number;
  category: Category;
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

export interface EventsTabBarTab {
  label: string;
  value: string;
}

export interface EventsTabBarProps {
  tabs: EventsTabBarTab[];
  value: string;
  onChange: (value: string) => void;
}