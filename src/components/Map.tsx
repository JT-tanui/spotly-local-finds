
import React, { useRef, useEffect, useState } from 'react';
import { Place, LocationData } from '@/types';
import { MapPin } from 'lucide-react';

interface MapProps {
  location: LocationData | null;
  places: Place[];
  selectedPlace: Place | null;
  onPlaceSelect: (place: Place | null) => void;
}

const Map: React.FC<MapProps> = ({ 
  location, 
  places, 
  selectedPlace,
  onPlaceSelect 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // This is a placeholder component for a map
  // In a real implementation, you would integrate with Google Maps or another mapping service
  useEffect(() => {
    if (!location) return;
    
    console.log("Map would initialize here with location:", location);
    
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [location]);

  // When selected place changes, the map would pan to that place
  useEffect(() => {
    if (selectedPlace && mapLoaded) {
      console.log("Map would pan to selected place:", selectedPlace.name);
    }
  }, [selectedPlace, mapLoaded]);

  if (!location) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="w-full h-full relative bg-blue-50">
      {/* Simulated map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100"></div>
      
      {/* Fake roads */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 right-0 h-1 bg-gray-300"></div>
        <div className="absolute top-2/4 left-0 right-0 h-1 bg-gray-300"></div>
        <div className="absolute top-3/4 left-0 right-0 h-1 bg-gray-300"></div>
        <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-gray-300"></div>
        <div className="absolute left-2/4 top-0 bottom-0 w-1 bg-gray-300"></div>
        <div className="absolute left-3/4 top-0 bottom-0 w-1 bg-gray-300"></div>
      </div>
      
      {/* Current location marker */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2"
        style={{ left: '50%', top: '50%' }}
      >
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="w-8 h-8 bg-blue-500 rounded-full opacity-30 absolute -top-2 -left-2"></div>
      </div>
      
      {/* Place markers */}
      {mapLoaded && places.map((place) => (
        <div 
          key={place.id}
          className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all ${
            selectedPlace?.id === place.id ? 'scale-125 z-10' : ''
          }`}
          style={{ 
            left: `${25 + Math.random() * 50}%`, 
            top: `${25 + Math.random() * 50}%` 
          }}
          onClick={() => onPlaceSelect(place)}
        >
          <div className={`flex flex-col items-center`}>
            <MapPin 
              className={`w-6 h-6 ${
                selectedPlace?.id === place.id ? 'text-spotly-red' : 'text-gray-600'
              } fill-current opacity-90`}
            />
            {selectedPlace?.id === place.id && (
              <div className="bg-white text-xs px-2 py-1 rounded-md shadow text-spotly-dark mt-1">
                {place.name}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Map attribution */}
      <div className="absolute bottom-1 right-1 text-xs text-gray-500">
        Map data (simulation)
      </div>
    </div>
  );
};

export default Map;
