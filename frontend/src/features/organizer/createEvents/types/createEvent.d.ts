export interface Category {
  id: number;
  name: string;
}

export interface TicketInput {
  id?: number; // <-- Make id optional for backend-created tickets
  type: string | undefined;
  price: number | string | undefined;
  totalQuantity: number | string | undefined;
  maxPerUser?: number | string | undefined;
}

export interface SpeakerInput {
  id?: number; // <-- Make id optional for backend-created speakers
  name: string;
  bio?: string;
  photoUrl?: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  startDatetime: string;
  endDatetime?: string;
  location?: string;
  locationType?: string;
  eventBannerUrl?: string;
  duration?: number;
  categories?: number[];
  tickets?: TicketInput[];
  speakers?: SpeakerInput[];
}
