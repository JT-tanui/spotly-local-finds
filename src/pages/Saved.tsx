
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlacesList from '@/components/PlacesList';
import { Place } from '@/types';
import { useLocation } from '@/hooks/useLocation';
import { usePlaces } from '@/hooks/usePlaces';

const Saved = () => {
  const navigate = useNavigate();
  const { location } = useLocation();
  const { allPlaces } = usePlaces(location);
  
  // Mock saved places - in a real app this would come from user data
  // For now, just use the first 5 places as mock saved places
  const [savedPlaces] = useState<Place[]>(allPlaces.slice(0, 5));

  const handlePlaceClick = (place: Place) => {
    navigate(`/place/${place.id}`);
  };
  
  return (
    <div className="pt-[62px] pb-20 px-4">
      <h1 className="text-2xl font-bold mb-6">Saved Places</h1>
      
      {savedPlaces.length > 0 ? (
        <PlacesList 
          places={savedPlaces} 
          loading={false} 
          onPlaceClick={handlePlaceClick}
        />
      ) : (
        <div className="text-center py-8">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 font-medium">No saved places yet</h3>
          <p className="text-sm text-muted-foreground">
            Save places you like by tapping the heart icon
          </p>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="mt-4"
          >
            Explore Places
          </Button>
        </div>
      )}
    </div>
  );
};

export default Saved;
