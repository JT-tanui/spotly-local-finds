
import React from 'react';
import { Place } from '@/types';
import PlaceCard from './PlaceCard';
import { Skeleton } from '@/components/ui/skeleton';

interface PlacesListProps {
  places: Place[];
  loading: boolean;
  onPlaceClick: (place: Place) => void;
  title?: string;
}

const PlacesList: React.FC<PlacesListProps> = ({ 
  places, 
  loading, 
  onPlaceClick,
  title
}) => {
  if (loading) {
    return (
      <div className="w-full">
        {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="rounded-lg overflow-hidden">
              <Skeleton className="w-full h-36" />
              <div className="p-3">
                <Skeleton className="w-3/4 h-4 mb-2" />
                <Skeleton className="w-1/2 h-3 mb-2" />
                <Skeleton className="w-1/3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-muted-foreground">No places found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {places.map((place) => (
          <PlaceCard 
            key={place.id} 
            place={place} 
            onClick={onPlaceClick} 
          />
        ))}
      </div>
    </div>
  );
};

export default PlacesList;
