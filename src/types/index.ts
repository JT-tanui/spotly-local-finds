
export interface Place {
  id: string;
  name: string;
  description?: string;
  category: PlaceCategory;
  address: string;
  distance?: number; // distance in km
  rating: number;
  reviewCount: number;
  price?: number; // price level 1-4
  imageUrl: string;
  location: {
    lat: number;
    lng: number;
  };
  openHours?: {
    open: boolean;
    hours?: string;
  };
  popularTimes?: {
    [key: string]: number[]; // 0-24 hours, 0-100 busyness
  };
  phone?: string;
  website?: string;
  isFeatured?: boolean;
}

export type PlaceCategory = 
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'park'
  | 'museum'
  | 'entertainment'
  | 'shopping'
  | 'fitness'
  | 'other';

export interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
}

export interface FilterOptions {
  category?: PlaceCategory | 'all';
  distance?: number; // max distance in km
  rating?: number; // min rating
  price?: number; // max price level
  openNow?: boolean;
}

export interface ReservationData {
  placeId: string;
  date: Date;
  time: string;
  partySize: number;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  waiveFee?: boolean;
}

// User profile types
export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  preferences?: UserPreferences;
  created_at: string;
  updated_at?: string;
}

export interface UserPreferences {
  favorite_categories?: PlaceCategory[];
  price_range?: number[];
  notification_settings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  location_sharing: boolean;
}

// Updated Event types to match database
export interface Event {
  id: string;
  creator_id: string;
  place_id: string;
  place?: Place;
  title: string;
  description?: string | null;
  event_date: string;
  created_at: string;
  max_participants?: number | null;
  status: 'active' | 'cancelled' | 'completed';
  participants?: EventParticipant[];
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: 'invited' | 'accepted' | 'declined' | 'maybe';
  created_at: string;
  user?: {
    name?: string;
    avatar_url?: string;
    email?: string;
  };
}

// Updated Reservation type to match database
export interface Reservation {
  id: string;
  user_id: string;
  place_id: string;
  place?: Place;
  reservation_date: string;
  party_size: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// New Ticket type for ticket purchases
export interface Ticket {
  id: string;
  user_id: string;
  place_id: string;
  place?: Place;
  event_id?: string;
  event?: Event;
  ticket_type: 'standard' | 'vip' | 'early_bird';
  price: number;
  purchase_date: string;
  event_date: string;
  status: 'valid' | 'used' | 'expired' | 'cancelled';
  qr_code?: string;
  created_at: string;
}

// New Message type for in-app messaging
export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

// New Invitation type
export interface Invitation {
  id: string;
  event_id: string;
  sender_id: string;
  recipient_email: string;
  status: 'sent' | 'accepted' | 'expired';
  medium: 'email' | 'sms' | 'in_app';
  created_at: string;
}
