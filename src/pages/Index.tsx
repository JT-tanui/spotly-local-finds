
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SearchFilters from '@/components/SearchFilters';
import PlacesList from '@/components/PlacesList';
import Map from '@/components/Map';
import { FilterOptions, Place } from '@/types';
import { useLocation } from '@/hooks/useLocation';
import { usePlaces } from '@/hooks/usePlaces';
import { Button } from '@/components/ui/button';
import { MapPin, List, Map as MapIcon } from 'lucide-react';

const Index = () => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ category: 'all' });
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  const { location, loading: locationLoading } = useLocation();
  const { 
    places, 
    featuredPlaces, 
    loading: placesLoading 
  } = usePlaces(location, filterOptions);

  const handleFilterChange = (filters: FilterOptions) => {
    setFilterOptions(filters);
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    // In a real app, this would navigate to a detail page
    console.log("Viewing details for:", place.name);
  };

  const handleLocationClick = () => {
    // In a real app, this would open a location selection modal
    console.log("Opening location selector");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar location={location} onLocationClick={handleLocationClick} />
      
      <main className="flex-1 pt-[62px] flex flex-col">
        {/* Search filters */}
        <div className="p-4 border-b">
          <SearchFilters onFilterChange={handleFilterChange} initialFilters={filterOptions} />
        </div>
        
        {/* View mode toggle */}
        <div className="flex justify-center px-4 py-2 border-b">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              className="rounded-l-md rounded-r-none"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-1" /> List
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              className="rounded-r-md rounded-l-none"
              onClick={() => setViewMode('map')}
            >
              <MapIcon className="w-4 h-4 mr-1" /> Map
            </Button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="flex-1 p-4 overflow-y-auto">
            {featuredPlaces.length > 0 && (
              <div className="mb-8">
                <PlacesList 
                  title="Featured Places" 
                  places={featuredPlaces} 
                  loading={locationLoading || placesLoading} 
                  onPlaceClick={handlePlaceClick} 
                />
              </div>
            )}
            
            <PlacesList 
              title="Places Near You" 
              places={places} 
              loading={locationLoading || placesLoading} 
              onPlaceClick={handlePlaceClick} 
            />
          </div>
        ) : (
          <div className="flex-1 relative">
            <Map 
              location={location}
              places={places}
              selectedPlace={selectedPlace}
              onPlaceSelect={handlePlaceClick}
            />
            {selectedPlace && (
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="bg-background rounded-lg shadow-lg p-4 mx-auto max-w-md">
                  <div className="flex justify-between">
                    <h3 className="font-bold">{selectedPlace.name}</h3>
                    <Button size="sm" variant="default">View Details</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedPlace.distance} km away • {selectedPlace.category}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
