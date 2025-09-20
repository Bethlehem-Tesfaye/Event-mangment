export interface EventsParams {
  limit?: number;
  offset?: number;
  search?: string;
  category?: string;
}
export interface EventType {
  id: string | number;
  title: string;
  startDatetime: string;
  location: string;
  eventBannerUrl?: string;
}

export interface CategorySelectorProps {
  categories: string[];
  selected: string | null;
  onSelect: (cat: string | null) => void;
  isLoading?: boolean;
}

export interface EventGridProps {
  events: EventType[];
  isLoading: boolean;
}

export interface BrowsePageProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  events: EventType[];
  eventsLoading: boolean;
  categoriesLoading: boolean;
  currentPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  limit: number;
}

export interface NavbarProps {
  isLoggedIn: boolean;
  searchValue?: string;
  onSearchChange?: (q: string) => void;
  onSearchSubmit?: () => void;
  onLogout:() => void;
}

export interface EventDetail {
  id: number;
  title: string;
  description: string;
  location: string;
  status: string;
  startDatetime: string;
  endDatetime: string;
  eventBannerUrl: string;
  tickets: Ticket[];
  eventSpeakers: Speaker[];
  eventCategories: EventCategory[];
  user: {
    id: number;
    email: string;
  };
}

export interface EventResponse {
  event: EventDetail;
}

export interface EventDetailsCardProps {
  event: EventDetail;
}
export interface Ticket {
  id: number;
  eventId: number;
  type: string;
  price: string;
  remainingQuantity: number;
  maxPerUser: number;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Speaker {
  id: number;
  eventId: number;
  name: string;
  bio: string;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Speaker {
  id: number;
  name: string;
  bio?: string;
  photoUrl?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  city?: string;
  country?: string;
}

export interface User {
  email: string;
  profile: UserProfile;
}

export interface EventCategory {
  category: Category;
  [key: string]: any; 
}
export interface Event {
  description?: string;
  startDatetime: string;
  endDatetime: string;
  duration: number;
  locationType: string;
  eventCategories: EventCategory[];
  user?: User;
}

export interface EventTabsProps {
  event: Event;
  speakers: Speaker[];
  loading?: boolean;
}

export interface InputFieldProps  {
  label: string;
  value: string | number;
  onChange: (v: any) => void;
  type?: string;
  min?: number;
  max?: number;
  required?: boolean;
};

export interface PurchaseModalProps {
  ticket: Ticket | null;
  open: boolean;
  onClose: () => void;
  onPurchase: (attendeeName: string, attendeeEmail: string, quantity: number) => void;
}

export interface InputFieldProps{
  label: string;
  value: string | number;
  onChange: (v: any) => void;
  type?: string;
  min?: number;
  max?: number;
  required?: boolean;
};