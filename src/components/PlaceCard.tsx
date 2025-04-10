
import React from 'react';
import { Place } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Star, CircleDollarSign, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PlaceCardProps {
  place: Place;
  onClick: (place: Place) => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onClick }) => {
  const { name, category, rating, reviewCount, price, imageUrl, distance, openHours } = place;
  
  // Format price as $ symbols
  const priceDisplay = price ? '$'.repeat(price) : '';
  
  // Get category display name
  const getCategoryDisplay = (category: string) => {
    const categoryMap: {[key: string]: string} = {
      restaurant: 'Restaurant',
      cafe: 'Café',
      bar: 'Bar',
      park: 'Park',
      museum: 'Museum',
      entertainment: 'Entertainment',
      shopping: 'Shopping',
      fitness: 'Fitness',
      other: 'Place'
    };
    
    return categoryMap[category] || 'Place';
  };

  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
      onClick={() => onClick(place)}
    >
      <div className="relative h-36 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover"
        />
        {openHours && (
          <Badge 
            className={`absolute top-2 right-2 ${openHours.open ? 'bg-green-500' : 'bg-gray-500'}`}
          >
            {openHours.open ? 'Open' : 'Closed'}
          </Badge>
        )}
      </div>
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-base truncate">{name}</h3>
          <div className="flex items-center text-sm">
            <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
            <span>{rating}</span>
            <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="mr-2">{getCategoryDisplay(category)}</span>
          {priceDisplay && (
            <span className="mr-2 text-muted-foreground">{priceDisplay}</span>
          )}
        </div>

        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{distance} km away</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaceCard;
