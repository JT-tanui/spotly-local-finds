
import { Place } from '../types';

export const mockPlaces: Place[] = [
  {
    id: '1',
    name: 'Harbor View Restaurant',
    description: 'Upscale seafood restaurant with incredible harbor views and fresh caught seafood.',
    category: 'restaurant',
    address: '123 Main St, Seaside, CA',
    distance: 0.8,
    rating: 4.7,
    reviewCount: 342,
    price: 3,
    imageUrl: '/placeholder.svg',
    location: {
      lat: 34.0522,
      lng: -118.2437
    },
    openHours: {
      open: true,
      hours: '11:00 AM - 10:00 PM'
    },
    phone: '555-123-4567',
    website: 'https://example.com/harborview',
    isFeatured: true
  },
  {
    id: '2',
    name: 'Central Park',
    description: 'Large urban park with walking trails, a lake, and beautiful gardens.',
    category: 'park',
    address: '456 Park Ave, Seaside, CA',
    distance: 1.2,
    rating: 4.9,
    reviewCount: 512,
    imageUrl: '/placeholder.svg',
    location: {
      lat: 34.0530,
      lng: -118.2420
    },
    openHours: {
      open: true,
      hours: '6:00 AM - 10:00 PM'
    },
    isFeatured: true
  },
  {
    id: '3',
    name: 'The Cozy Café',
    description: 'Charming café serving artisan coffee, pastries, and light meals.',
    category: 'cafe',
    address: '789 Oak St, Seaside, CA',
    distance: 0.4,
    rating: 4.5,
    reviewCount: 187,
    price: 2,
    imageUrl: '/placeholder.svg',
    location: {
      lat: 34.0500,
      lng: -118.2500
    },
    openHours: {
      open: true,
      hours: '7:00 AM - 7:00 PM'
    },
    phone: '555-987-6543'
  },
  {
    id: '4',
    name: 'Modern Art Museum',
    description: 'Contemporary art museum featuring rotating exhibitions and permanent collections.',
    category: 'museum',
    address: '101 Museum Blvd, Seaside, CA',
    distance: 2.1,
    rating: 4.6,
    reviewCount: 298,
    price: 2,
    imageUrl: '/placeholder.svg',
    location: {
      lat: 34.0550,
      lng: -118.2400
    },
    openHours: {
      open: true,
      hours: '10:00 AM - 5:00 PM'
    },
    website: 'https://example.com/modernart'
  },
  {
    id: '5',
    name: 'Night Owl Bar',
    description: 'Trendy bar with craft cocktails, local beers, and live music on weekends.',
    category: 'bar',
    address: '222 Nightlife St, Seaside, CA',
    distance: 1.5,
    rating: 4.4,
    reviewCount: 215,
    price: 3,
    imageUrl: '/placeholder.svg',
    location: {
      lat: 34.0510,
      lng: -118.2450
    },
    openHours: {
      open: true,
      hours: '5:00 PM - 2:00 AM'
    },
    phone: '555-321-7890'
  },
  {
    id: '6',
    name: 'Family Fun Center',
    description: 'Entertainment center with arcade games, mini-golf, and laser tag.',
    category: 'entertainment',
    address: '333 Fun Ave, Seaside, CA',
    distance: 3.2,
    rating: 4.3,
    reviewCount: 176,
    price: 2,
    imageUrl: '/placeholder.svg',
    location: {
      lat: 34.0490,
      lng: -118.2520
    },
    openHours: {
      open: true,
      hours: '12:00 PM - 9:00 PM'
    },
    website: 'https://example.com/familyfun'
  },
  {
    id: '7',
    name: 'Seaside Fitness Club',
    description: 'Modern gym with state-of-the-art equipment, classes, and personal training.',
    category: 'fitness',
    address: '444 Fit Lane, Seaside, CA',
    distance: 1.8,
    rating: 4.2,
    reviewCount: 128,
    price: 3,
    imageUrl: '/placeholder.svg',
    location: {
      lat: 34.0515,
      lng: -118.2470
    },
    openHours: {
      open: true,
      hours: '5:00 AM - 11:00 PM'
    },
    phone: '555-765-4321',
    website: 'https://example.com/seasidefit'
  },
  {
    id: '8',
    name: 'Downtown Shopping Mall',
    description: 'Large shopping center with a variety of retail stores and restaurants.',
    category: 'shopping',
    address: '555 Mall St, Seaside, CA',
    distance: 2.5,
    rating: 4.0,
    reviewCount: 356,
    imageUrl: '/placeholder.svg',
    location: {
      lat: 34.0540,
      lng: -118.2410
    },
    openHours: {
      open: true,
      hours: '10:00 AM - 9:00 PM'
    },
    website: 'https://example.com/downtownmall'
  }
];
