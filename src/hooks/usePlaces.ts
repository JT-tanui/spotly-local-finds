
import { useState, useEffect, useMemo } from 'react';
import { Place, FilterOptions, LocationData } from '../types';
import { mockPlaces } from '../data/mockPlaces';

export function usePlaces(location: LocationData | null, filterOptions: FilterOptions = {}) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate distances if location is available
  useEffect(() => {
    if (location) {
      const placesWithDistance = mockPlaces.map(place => {
        const distance = calculateDistance(
          location.lat,
          location.lng,
          place.location.lat,
          place.location.lng
        );
        
        return { ...place, distance };
      });
      
      setPlaces(placesWithDistance);
      setLoading(false);
    }
  }, [location]);

  // Filter places based on filter options
  const filteredPlaces = useMemo(() => {
    if (!places.length) return [];
    
    return places.filter(place => {
      // Filter by category
      if (filterOptions.category && filterOptions.category !== 'all' && place.category !== filterOptions.category) {
        return false;
      }
      
      // Filter by distance
      if (filterOptions.distance && place.distance && place.distance > filterOptions.distance) {
        return false;
      }
      
      // Filter by rating
      if (filterOptions.rating && place.rating < filterOptions.rating) {
        return false;
      }
      
      // Filter by price
      if (filterOptions.price && place.price && place.price > filterOptions.price) {
        return false;
      }
      
      // Filter by open now
      if (filterOptions.openNow && (!place.openHours || !place.openHours.open)) {
        return false;
      }
      
      return true;
    });
  }, [places, filterOptions]);

  // Featured places
  const featuredPlaces = useMemo(() => {
    return places.filter(place => place.isFeatured);
  }, [places]);
  
  // Helper function to calculate distance between two coordinates
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(1));
  }
  
  function deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  return {
    places: filteredPlaces,
    featuredPlaces,
    allPlaces: places,
    loading,
    error
  };
}
