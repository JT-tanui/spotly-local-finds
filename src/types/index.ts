
export interface Place {
  id: string;
  name: string;
  imageUrl: string;
  address: string;
  category: 'restaurant' | 'hotel' | 'activity' | 'other' | 'park' | 'cafe' | 'museum' | 'bar' | 'entertainment' | 'fitness' | 'shopping';
  rating: number;
  reviewCount: number;
  location: {
    lat: number;
    lng: number;
  };
  description?: string;
  distance?: number;
  price?: number;
  openHours?: string;
  isFeatured?: boolean;
  popularTimes?: any;
  website?: string;
  phone?: string;
}

export interface UserProfile {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  website?: string;
  email?: string;
  favorites?: Place[];
  past_bookings?: any[];
  bookings_count?: number;
  saved_count?: number;
  free_reservations?: number;
  loyalty_points?: number;
  phone?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  place_id: string;
  creator_id: string;
  status: string;
  max_participants: number;
  created_at: string;
  creator?: {
    full_name: string;
    avatar_url?: string;
  };
  participants?: {
    id: string;
    user_id: string;
    status: string;
  }[];
  participants_count?: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface FilterOptions {
  category?: string;
  price?: number[];
  distance?: number;
  rating?: number;
  openNow?: boolean;
  featured?: boolean;
}

export interface PlaceCategory {
  id: string;
  name: string;
  icon: string;
}

export interface Reservation {
  id: string;
  placeId: string;
  date: string;
  time: string;
  partySize: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  placeName: string;
  placeImage: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  purchaseDate: string;
  price: number;
  status: 'active' | 'used' | 'expired';
  eventName: string;
  eventImage: string;
  eventDate: string;
}

export interface ReservationData {
  id?: string;
  date: Date;
  time: string;
  partySize: number;
  name: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface EventParticipant {
  id: string;
  user_id: string;
  event_id: string;
  status: 'going' | 'maybe' | 'not_going';
  user: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
  requireInteraction?: boolean;
  silent?: boolean;
}
