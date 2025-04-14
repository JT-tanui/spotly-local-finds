export interface Place {
  id: string;
  name: string;
  imageUrl: string;
  address: string;
  category: 'restaurant' | 'hotel' | 'activity' | 'other';
  rating: number;
  reviewCount: number;
  location: {
    lat: number;
    lng: number;
  };
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
