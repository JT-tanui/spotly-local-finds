
import React from 'react';
import { Place } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiscoverGridProps {
  places: Place[];
  onPlaceClick: (place: Place) => void;
  className?: string;
}

const DiscoverGrid: React.FC<DiscoverGridProps> = ({ places, onPlaceClick, className }) => {
  // Helper function to determine column span
  const getColSpan = (index: number) => {
    // Create an interesting masonry-like layout
    // Even items span 1 column, odd items span 2
    // But also vary based on position in the grid
    if (index % 6 === 0) return 'md:col-span-2'; // Featured item
    if (index % 5 === 0) return 'md:col-span-2 md:row-span-2'; // Tall featured item
    if (index % 3 === 0) return 'md:row-span-2'; // Tall item
    return '';
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className || ''}`}>
      {places.map((place, index) => (
        <Card 
          key={place.id}
          className={`overflow-hidden group cursor-pointer hover:shadow-lg transition-all ${getColSpan(index)}`}
          onClick={() => onPlaceClick(place)}
        >
          <div className="relative h-full">
            <img 
              src={place.imageUrl} 
              alt={place.name} 
              className="w-full h-full object-cover aspect-square"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
            
            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-3 text-white">
              <div className="flex justify-between">
                <Badge className="bg-white/20 backdrop-blur-sm border-none">
                  {place.category}
                </Badge>
                {place.isFeatured && (
                  <Badge className="bg-spotly-red/80">Featured</Badge>
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium">{place.rating}</span>
                  <span className="text-xs text-white/70">({place.reviewCount})</span>
                </div>
                
                <h3 className="font-bold text-lg mb-1 line-clamp-1">{place.name}</h3>
                
                <p className="text-sm text-white/80 line-clamp-2 mb-2">
                  {place.description || `Experience ${place.category} at its finest, just ${place.distance}km away.`}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">{place.distance}km away</span>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DiscoverGrid;
