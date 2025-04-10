
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
