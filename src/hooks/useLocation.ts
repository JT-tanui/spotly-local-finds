
import { useState, useEffect } from 'react';
import { LocationData } from '../types';

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get current location using Geolocation API
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, lng } = position.coords;
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setError("Unable to retrieve your location. Please allow location access or enter it manually.");
        setLoading(false);
        
        // Fall back to default location
        setLocation({
          lat: 34.052235,
          lng: -118.243683,
          city: "Los Angeles"
        });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Function to set location manually
  const setManualLocation = (locationData: LocationData) => {
    setLocation(locationData);
    setError(null);
  };

  // Initialize with current location
  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    setManualLocation
  };
}
