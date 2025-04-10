
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, X, Locate } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/hooks/useLocation';
import { LocationData } from '@/types';

// Mock cities for search suggestions
const popularCities = [
  { city: 'New York', lat: 40.7128, lng: -74.0060 },
  { city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  { city: 'Chicago', lat: 41.8781, lng: -87.6298 },
  { city: 'Miami', lat: 25.7617, lng: -80.1918 },
  { city: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  { city: 'Seattle', lat: 47.6062, lng: -122.3321 }
];

const LocationPicker = () => {
  const navigate = useNavigate();
  const { location, getCurrentLocation, setManualLocation } = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 1) {
      // Filter cities based on search query
      const results = popularCities
        .filter(city => city.city.toLowerCase().includes(query.toLowerCase()))
        .map(city => ({
          lat: city.lat,
          lng: city.lng,
          city: city.city
        }));
      
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };
  
  // Handle city selection
  const handleSelectCity = (selectedCity: LocationData) => {
    setManualLocation(selectedCity);
    navigate('/');
  };
  
  // Handle current location button
  const handleUseCurrentLocation = () => {
    getCurrentLocation();
    navigate('/');
  };
  
  return (
    <div className="pt-[62px] pb-20 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Set Location</h1>
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search cities..."
          className="pl-8"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Current Location Button */}
      <Button 
        variant="outline" 
        className="w-full mb-6 flex items-center justify-center"
        onClick={handleUseCurrentLocation}
      >
        <Locate className="mr-2 h-4 w-4" />
        Use my current location
      </Button>
      
      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Search Results</h2>
          {searchResults.map((result, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => handleSelectCity(result)}
            >
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              {result.city}
            </Button>
          ))}
        </div>
      )}
      
      {/* Popular Cities */}
      {!searchQuery && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Popular Cities</h2>
          {popularCities.map((city, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => handleSelectCity(city)}
            >
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              {city.city}
            </Button>
          ))}
        </div>
      )}
      
      {/* Current Location Info */}
      {location && (
        <div className="mt-6 p-3 border rounded-lg">
          <h3 className="text-sm font-medium">Current Location</h3>
          <p className="text-sm text-muted-foreground">
            {location.city || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
