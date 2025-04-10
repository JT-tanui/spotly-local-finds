
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowDownAZ, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlacesList from '@/components/PlacesList';
import { Place } from '@/types';
import { useLocation } from '@/hooks/useLocation';
import { usePlaces } from '@/hooks/usePlaces';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SortOption = 'recent' | 'closest' | 'alphabetical';

const Saved = () => {
  const navigate = useNavigate();
  const { location } = useLocation();
  const { allPlaces } = usePlaces(location);
  
  // Mock saved places - in a real app this would come from user data
  // For now, just use the first 5 places as mock saved places
  const [savedPlaces] = useState<Place[]>(allPlaces.slice(0, 5));
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const handlePlaceClick = (place: Place) => {
    navigate(`/place/${place.id}`);
  };
  
  // Sort saved places based on selected sort option
  const sortedPlaces = React.useMemo(() => {
    if (!savedPlaces.length) return [];
    
    let sorted = [...savedPlaces];
    switch (sortBy) {
      case 'alphabetical':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'closest':
        return sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      case 'recent':
      default:
        return sorted; // Assuming the default order is most recently saved
    }
  }, [savedPlaces, sortBy]);

  return (
    <div className="pt-[62px] pb-20 px-4">
      <h1 className="text-2xl font-bold mb-4">Saved Places</h1>
      
      {savedPlaces.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
              <Button 
                size="sm" 
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                className="rounded-full text-xs"
                onClick={() => setSortBy('recent')}
              >
                <Clock className="w-3 h-3 mr-1" />
                Recent
              </Button>
              <Button 
                size="sm" 
                variant={sortBy === 'closest' ? 'default' : 'outline'}
                className="rounded-full text-xs"
                onClick={() => setSortBy('closest')}
              >
                <MapPin className="w-3 h-3 mr-1" />
                Closest
              </Button>
              <Button 
                size="sm" 
                variant={sortBy === 'alphabetical' ? 'default' : 'outline'}
                className="rounded-full text-xs"
                onClick={() => setSortBy('alphabetical')}
              >
                <ArrowDownAZ className="w-3 h-3 mr-1" />
                A-Z
              </Button>
            </div>
            
            <div className="flex space-x-1">
              <Button 
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="rounded-l-md rounded-r-none px-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
              </Button>
              <Button 
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                className="rounded-r-md rounded-l-none px-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grid-2x2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
              </Button>
            </div>
          </div>

          <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : ''}`}>
            {sortedPlaces.map((place) => (
              <div 
                key={place.id}
                className={`${viewMode === 'grid' ? '' : 'mb-3'} bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow animate-fade-in`}
                onClick={() => handlePlaceClick(place)}
              >
                <div className="relative h-32">
                  <img 
                    src={place.imageUrl} 
                    alt={place.name} 
                    className="w-full h-full object-cover"
                  />
                  <button 
                    className="absolute top-2 right-2 p-1 bg-white/80 rounded-full shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle remove from favorites
                    }}
                  >
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </button>
                </div>
                <div className="p-2">
                  <h3 className="font-semibold text-sm truncate">{place.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{place.category}</span>
                    <span className="text-xs flex items-center text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-0.5" />
                      {place.distance}km
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8 bg-background rounded-2xl border shadow-sm">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 font-medium">No saved places yet</h3>
          <p className="text-sm text-muted-foreground">
            Save places you like by tapping the heart icon
          </p>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="mt-4 rounded-full"
          >
            Explore Places
          </Button>
        </div>
      )}
    </div>
  );
};

export default Saved;
