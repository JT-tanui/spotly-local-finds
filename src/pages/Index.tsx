
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SearchFilters from '@/components/SearchFilters';
import PlacesList from '@/components/PlacesList';
import Map from '@/components/Map';
import { FilterOptions, Place } from '@/types';
import { useLocation } from '@/hooks/useLocation';
import { usePlaces } from '@/hooks/usePlaces';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, List, Map as MapIcon, Calendar, Sparkles, Star } from 'lucide-react';
import { useIsDesktop, useIsTablet, useIsMobile } from '@/hooks/useMediaQuery';

const Index = () => {
  const navigate = useNavigate();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ category: 'all' });
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  const { location, loading: locationLoading } = useLocation();
  const { 
    places, 
    featuredPlaces, 
    loading: placesLoading,
    allPlaces 
  } = usePlaces(location, filterOptions);
  
  const isDesktop = useIsDesktop();
  const isTablet = useIsTablet();

  // Create trending places based on all places
  const trendingPlaces = React.useMemo(() => {
    return allPlaces
      .filter(p => p.rating >= 4.5)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  }, [allPlaces]);
  
  // Create new places - use first 3
  const newPlaces = React.useMemo(() => {
    return allPlaces.slice(0, 3);
  }, [allPlaces]);
  
  // Create weekly picks - use places 6-10
  const weeklyPicks = React.useMemo(() => {
    return allPlaces.slice(6, 10);
  }, [allPlaces]);

  const handleFilterChange = (filters: FilterOptions) => {
    setFilterOptions(filters);
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    navigate(`/place/${place.id}`);
  };

  const handleLocationClick = () => {
    navigate('/location');
  };

  const categories = [
    { id: 'restaurant', name: '🍽️ Dining', color: 'bg-gradient-coral' },
    { id: 'cafe', name: '☕ Cafes', color: 'bg-gradient-mint' },
    { id: 'bar', name: '🍷 Bars', color: 'bg-gradient-deep-blue' },
    { id: 'park', name: '🏞️ Parks', color: 'bg-gradient-sky' },
    { id: 'museum', name: '🖼️ Museums', color: 'bg-amber-100' },
    { id: 'entertainment', name: '🎭 Fun', color: 'bg-purple-100' },
    { id: 'shopping', name: '🛍️ Shopping', color: 'bg-pink-100' },
    { id: 'fitness', name: '💪 Fitness', color: 'bg-green-100' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar location={location} onLocationClick={handleLocationClick} />
      
      <main className={`flex-1 pt-[62px] flex flex-col ${isDesktop ? 'px-6' : 'px-0'}`}>
        {/* Hello Bar */}
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold">Hey there, ready to discover?</h1>
          <p className="text-sm text-muted-foreground">Find amazing spots in {location?.city || "your area"}</p>
        </div>
        
        {/* Search filters */}
        <div className="p-4 border-b">
          <SearchFilters onFilterChange={handleFilterChange} initialFilters={filterOptions} />
        </div>
        
        {/* Category Pills - Horizontal Scrollable */}
        <div className="px-4 py-3 overflow-x-auto scrollbar-none">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <Button 
                key={category.id}
                variant="outline"
                size="sm"
                className={`rounded-full whitespace-nowrap text-xs px-3 py-1 ${
                  filterOptions.category === category.id ? 'bg-spotly-red text-white' : category.color
                }`}
                onClick={() => setFilterOptions({...filterOptions, category: category.id as any})}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* View mode toggle */}
        <div className="flex justify-between px-4 py-2 border-b items-center">
          <div className="flex items-center text-sm">
            <MapPin className="w-3 h-3 mr-1" />
            <span>Showing results near {location?.city || "your location"}</span>
          </div>
          
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
            {/* Featured Carousel */}
            {featuredPlaces.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-lg flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                    Featured Places
                  </h2>
                  <Button variant="link" size="sm" className="text-spotly-red">
                    View all
                  </Button>
                </div>
                
                <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
                  <div className="flex space-x-4">
                    {featuredPlaces.map(place => (
                      <div 
                        key={place.id}
                        className="min-w-[260px] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer bg-white"
                        onClick={() => handlePlaceClick(place)}
                      >
                        <div className="relative h-40">
                          <img 
                            src={place.imageUrl} 
                            alt={place.name} 
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-2 right-2 bg-spotly-red">Featured</Badge>
                          {place.category && (
                            <Badge className="absolute bottom-2 left-2 bg-black/50">{place.category}</Badge>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold truncate">{place.name}</h3>
                          <div className="flex items-center text-sm mt-1">
                            <div className="flex items-center mr-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="ml-1">{place.rating}</span>
                            </div>
                            <span className="text-muted-foreground text-xs">{place.distance} km away</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Trending This Week */}
            {trendingPlaces.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-lg flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-spotly-blue" />
                    Trending This Week
                  </h2>
                  <Button variant="link" size="sm" className="text-spotly-blue">
                    View all
                  </Button>
                </div>
                
                <div className={`grid ${isDesktop ? 'grid-cols-3' : isTablet ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  {trendingPlaces.map(place => (
                    <div 
                      key={place.id}
                      className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer bg-white hover:scale-[1.02]"
                      onClick={() => handlePlaceClick(place)}
                    >
                      <div className="relative h-32">
                        <img 
                          src={place.imageUrl} 
                          alt={place.name} 
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-orange-500">Trending 🔥</Badge>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold truncate">{place.name}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{place.category}</span>
                          <span className="text-xs text-muted-foreground">{place.distance} km</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New This Week */}
            {newPlaces.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-lg">New This Week</h2>
                </div>
                
                <div className={`grid ${isTablet ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  {newPlaces.map(place => (
                    <div 
                      key={place.id}
                      className="flex bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => handlePlaceClick(place)}
                    >
                      <div className="w-24 h-24">
                        <img 
                          src={place.imageUrl} 
                          alt={place.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-sm">{place.name}</h3>
                          <Badge className="bg-green-100 text-green-800">New</Badge>
                        </div>
                        <div className="flex items-center mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs ml-1">{place.rating}</span>
                          <span className="text-xs text-muted-foreground ml-2">•</span>
                          <span className="text-xs text-muted-foreground ml-2">{place.distance} km</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {place.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Weekly Picks by Spotly */}
            {weeklyPicks.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-lg">Weekly Picks by Spotly</h2>
                </div>
                
                <div className={`grid ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  {weeklyPicks.map(place => (
                    <div 
                      key={place.id}
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                      onClick={() => handlePlaceClick(place)}
                    >
                      <div className="relative h-32">
                        <img 
                          src={place.imageUrl} 
                          alt={place.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-2 left-3 text-white">
                          <h3 className="font-semibold">{place.name}</h3>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="ml-1 text-xs">{place.rating}</span>
                            <span className="ml-2 text-xs">{place.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Places Near You */}
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
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => navigate(`/place/${selectedPlace.id}`)}
                    >
                      View Details
                    </Button>
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
