
// Add the Event type interface

export interface IconFilterProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  place_id: string;
  creator_id: string;
  status: string;
  max_participants?: number;
  created_at: string;
  creator: {
    full_name: string;
    avatar_url?: string;
  };
  place: Place;
  participants: Array<{
    id: string;
    event_id: string;
    user_id: string;
    status: string;
    created_at: string;
    user: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
  }>;
}

export interface Place {
  id: string;
  name: string;
  category?: string;
  rating: number;
  distance: number;
  imageUrl: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface FilterOptions {
  category: string;
  price?: string;
  rating?: number;
}

export interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
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
