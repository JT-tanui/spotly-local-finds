
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
  openHours?: {
    open: boolean;
    hours: string;
  };
  isFeatured?: boolean;
  popularTimes?: any;
  website?: string;
  phone?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  email: string;
  phone?: string;
  website?: string;
  bio?: string;
  location?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
    email_frequency?: 'daily' | 'weekly' | 'never';
    push_notifications?: boolean;
    privacy?: 'public' | 'private';
  };
  stats?: {
    bookings_count: number;
    saved_count: number;
    free_reservations: number;
    loyalty_points: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  place_id: string;
  creator_id: string;
  status: string;
  max_participants: number | null;
  created_at: string;
  creator?: {
    full_name: string;
    avatar_url?: string;
  };
  place?: Place;
  participants?: EventParticipant[];
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
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  placeName: string;
  placeImage: string;
  reservation_date?: string; // Added for compatibility
  place?: Place;
}

export interface Ticket {
  id: string;
  eventId: string;
  eventName: string;
  eventImage: string;
  eventDate: string;
  purchaseDate: string;
  price: number;
  status: 'active' | 'used' | 'expired' | 'valid';
  ticketType?: string;
  place?: Place;
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
  status: 'going' | 'maybe' | 'not_going' | 'invited' | 'accepted' | 'declined';
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface ParticipantData {
  id: string;
  user_id: string;
  event_id: string;
  status: 'going' | 'maybe' | 'not_going' | 'invited' | 'accepted' | 'declined';
  created_at: string;
  user?: {
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

export interface EventDetailsModalProps {
  open: boolean; 
  onClose: () => void;
  event: Event;
  place: Place;
  isOwner: boolean;
  onUpdateEvent: () => void;
}

export interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (newEvent: Event) => void;
  places?: Place[];
}

export interface EventCardProps {
  event: Event;
  onEventClick?: (event: Event) => void;
}

export interface IconFilterProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

// Payment types
export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'canceled' | 'failed';
  created_at: string;
  payment_method?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
  description?: string;
}

// Checkout interfaces
export interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  paymentMethod: 'card' | 'paypal';
  savePaymentMethod: boolean;
}
