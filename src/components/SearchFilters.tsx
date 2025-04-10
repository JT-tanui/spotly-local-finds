
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Utensils, Coffee, Wine, 
  TreePine, Building, Music, 
  ShoppingBag, Dumbbell,
  Star, CircleDollarSign, Clock
} from 'lucide-react';
import { FilterOptions, PlaceCategory } from '@/types';

interface SearchFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

const categoryIcons = {
  restaurant: <Utensils className="h-4 w-4" />,
  cafe: <Coffee className="h-4 w-4" />,
  bar: <Wine className="h-4 w-4" />,
  park: <TreePine className="h-4 w-4" />,
  museum: <Building className="h-4 w-4" />,
  entertainment: <Music className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  fitness: <Dumbbell className="h-4 w-4" />,
  all: null
};

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  onFilterChange, 
  initialFilters = { category: 'all' }
}) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const handleCategoryChange = (category: PlaceCategory | 'all') => {
    const newFilters = { ...filters, category };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleOpenNowChange = () => {
    const newFilters = { ...filters, openNow: !filters.openNow };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="w-full">
      {/* Horizontal scrollable category filters */}
      <div className="flex overflow-x-auto py-2 space-x-2 no-scrollbar">
        <Button
          variant={filters.category === 'all' ? 'default' : 'outline'}
          size="sm"
          className="whitespace-nowrap"
          onClick={() => handleCategoryChange('all')}
        >
          All Places
        </Button>
        <Button
          variant={filters.category === 'restaurant' ? 'default' : 'outline'}
          size="sm"
          className="whitespace-nowrap"
          onClick={() => handleCategoryChange('restaurant')}
        >
          {categoryIcons.restaurant} <span className="ml-1">Restaurants</span>
        </Button>
        <Button
          variant={filters.category === 'cafe' ? 'default' : 'outline'}
          size="sm"
          className="whitespace-nowrap"
          onClick={() => handleCategoryChange('cafe')}
        >
          {categoryIcons.cafe} <span className="ml-1">Cafes</span>
        </Button>
        <Button
          variant={filters.category === 'bar' ? 'default' : 'outline'}
          size="sm"
          className="whitespace-nowrap"
          onClick={() => handleCategoryChange('bar')}
        >
          {categoryIcons.bar} <span className="ml-1">Bars</span>
        </Button>
        <Button
          variant={filters.category === 'park' ? 'default' : 'outline'}
          size="sm"
          className="whitespace-nowrap"
          onClick={() => handleCategoryChange('park')}
        >
          {categoryIcons.park} <span className="ml-1">Parks</span>
        </Button>
        <Button
          variant={filters.category === 'entertainment' ? 'default' : 'outline'}
          size="sm"
          className="whitespace-nowrap"
          onClick={() => handleCategoryChange('entertainment')}
        >
          {categoryIcons.entertainment} <span className="ml-1">Entertainment</span>
        </Button>
        <Button
          variant={filters.category === 'museum' ? 'default' : 'outline'}
          size="sm"
          className="whitespace-nowrap"
          onClick={() => handleCategoryChange('museum')}
        >
          {categoryIcons.museum} <span className="ml-1">Museums</span>
        </Button>
      </div>

      {/* Additional filters */}
      <div className="flex items-center justify-between py-2">
        <div className="flex space-x-2">
          <Button
            variant={filters.openNow ? 'default' : 'outline'}
            size="sm"
            className="whitespace-nowrap flex items-center"
            onClick={handleOpenNowChange}
          >
            <Clock className="h-4 w-4 mr-1" /> Open Now
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className="whitespace-nowrap"
        >
          {showMoreFilters ? 'Less Filters' : 'More Filters'}
        </Button>
      </div>

      {/* More filters panel */}
      {showMoreFilters && (
        <div className="flex flex-wrap gap-2 pt-2 pb-3 border-t border-gray-100">
          {/* Rating filter */}
          <div className="flex flex-col space-y-1">
            <span className="text-xs text-muted-foreground">Rating</span>
            <div className="flex space-x-1">
              {[3, 4, 4.5].map((rating) => (
                <Button
                  key={rating}
                  variant={filters.rating === rating ? 'default' : 'outline'}
                  size="sm"
                  className="px-2 py-1 h-8"
                  onClick={() => {
                    const newFilters = { ...filters, rating };
                    setFilters(newFilters);
                    onFilterChange(newFilters);
                  }}
                >
                  <Star className="h-3 w-3 mr-1 fill-current" /> {rating}+
                </Button>
              ))}
            </div>
          </div>
          
          {/* Price filter */}
          <div className="flex flex-col space-y-1">
            <span className="text-xs text-muted-foreground">Price</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((price) => (
                <Button
                  key={price}
                  variant={filters.price === price ? 'default' : 'outline'}
                  size="sm"
                  className="px-2 py-1 h-8"
                  onClick={() => {
                    const newFilters = { ...filters, price };
                    setFilters(newFilters);
                    onFilterChange(newFilters);
                  }}
                >
                  {Array(price).fill('$').join('')}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Distance filter */}
          <div className="flex flex-col space-y-1">
            <span className="text-xs text-muted-foreground">Distance</span>
            <div className="flex space-x-1">
              {[1, 3, 5, 10].map((distance) => (
                <Button
                  key={distance}
                  variant={filters.distance === distance ? 'default' : 'outline'}
                  size="sm"
                  className="px-2 py-1 h-8"
                  onClick={() => {
                    const newFilters = { ...filters, distance };
                    setFilters(newFilters);
                    onFilterChange(newFilters);
                  }}
                >
                  {distance} km
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
