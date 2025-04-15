
import { useState, useEffect } from 'react';
import { LocationData } from '../types';
import { CapacitorService } from '../services/capacitorService';

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNative, setIsNative] = useState<boolean>(false);

  useEffect(() => {
    // Check if we're running in a native environment
    setIsNative(CapacitorService.isNative());
  }, []);

  // Function to get current location using Geolocation API or Capacitor
  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isNative) {
        // Use Capacitor's Geolocation API on native platforms
        const nativeLocation = await CapacitorService.getCurrentPosition();
        if (nativeLocation) {
          setLocation(nativeLocation);
          setLoading(false);
          return;
        } else {
          throw new Error("Unable to get location from native device");
        }
      } else {
        // Use browser's Geolocation API as fallback
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by your browser");
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setLoading(false);
          },
          (error) => {
            console.warn("Geolocation error:", error.message);
            throw new Error(`Geolocation error: ${error.message}`);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setError("Unable to retrieve your location. Please allow location access or enter it manually.");
      setLoading(false);
      
      // Fall back to default location
      setLocation({
        latitude: 34.052235,
        longitude: -118.243683,
        city: "Los Angeles"
      });
    }
  };

  // Function to set location manually
  const setManualLocation = (locationData: LocationData) => {
    setLocation(locationData);
    setError(null);
  };

  // Initialize with current location
  useEffect(() => {
    // Don't try to get location immediately to avoid permission prompts before user action
    // Just set a default location instead
    setLocation({
      latitude: 34.052235,
      longitude: -118.243683,
      city: "Los Angeles"
    });
    setLoading(false);
    
    // Commented out for now to avoid automatic geolocation prompt
    // getCurrentLocation();
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    setManualLocation,
    isNative
  };
}
