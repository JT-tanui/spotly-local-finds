
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, TrendingUp, Coffee, Utensils, Wine, Tent, Music, Paintbrush, X, Filter } from "lucide-react";
import { FilterOptions } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconFilter } from './IconFilter';

interface SearchFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onFilterChange, initialFilters = {} }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: initialFilters.category || "all",
    price: initialFilters.price || [0, 4],
    distance: initialFilters.distance || 10,
    rating: initialFilters.rating || 0,
    openNow: initialFilters.openNow || false,
    featured: initialFilters.featured || false
  });

  useEffect(() => {
    // Notify parent component when filters change
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic
    console.log("Searching for:", searchQuery);
  };

  const clearFilters = () => {
    setFilters({
      category: "all",
      price: [0, 4],
      distance: 10,
      rating: 0,
      openNow: false,
      featured: false
    });
  };

  const handleCategorySelect = (category: string) => {
    setFilters({
      ...filters,
      category
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search places, events or activities..."
          className="pl-9 pr-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute right-2 top-2">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Reset
                  </Button>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-2">Categories</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={filters.category === "restaurant" ? "default" : "outline"}
                      size="sm" 
                      onClick={() => handleCategorySelect("restaurant")}
                      className="justify-start"
                    >
                      <Utensils className="mr-2 h-4 w-4" /> Restaurants
                    </Button>
                    <Button 
                      variant={filters.category === "cafe" ? "default" : "outline"}
                      size="sm" 
                      onClick={() => handleCategorySelect("cafe")}
                      className="justify-start"
                    >
                      <Coffee className="mr-2 h-4 w-4" /> Cafés
                    </Button>
                    <Button 
                      variant={filters.category === "bar" ? "default" : "outline"}
                      size="sm" 
                      onClick={() => handleCategorySelect("bar")}
                      className="justify-start"
                    >
                      <Wine className="mr-2 h-4 w-4" /> Bars
                    </Button>
                    <Button 
                      variant={filters.category === "park" ? "default" : "outline"}
                      size="sm" 
                      onClick={() => handleCategorySelect("park")}
                      className="justify-start"
                    >
                      <Tent className="mr-2 h-4 w-4" /> Parks
                    </Button>
                    <Button 
                      variant={filters.category === "entertainment" ? "default" : "outline"}
                      size="sm" 
                      onClick={() => handleCategorySelect("entertainment")}
                      className="justify-start"
                    >
                      <Music className="mr-2 h-4 w-4" /> Entertainment
                    </Button>
                    <Button 
                      variant={filters.category === "museum" ? "default" : "outline"}
                      size="sm" 
                      onClick={() => handleCategorySelect("museum")}
                      className="justify-start"
                    >
                      <Paintbrush className="mr-2 h-4 w-4" /> Museums
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium">Distance</h5>
                    <span className="text-sm text-muted-foreground">{filters.distance} km</span>
                  </div>
                  <Slider 
                    defaultValue={[filters.distance || 10]} 
                    max={50} 
                    step={1} 
                    onValueChange={(value) => {
                      setFilters({...filters, distance: value[0]})
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium">Rating</h5>
                    <div className="flex items-center">
                      {Array(5).fill(0).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < (filters.rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                          onClick={() => setFilters({...filters, rating: i + 1})}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="open-now">Open Now</Label>
                    <p className="text-sm text-muted-foreground">Only show places currently open</p>
                  </div>
                  <Switch
                    id="open-now"
                    checked={filters.openNow}
                    onCheckedChange={(checked) => setFilters({...filters, openNow: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="featured">Featured Places</Label>
                    <p className="text-sm text-muted-foreground">Show only featured locations</p>
                  </div>
                  <Switch
                    id="featured"
                    checked={filters.featured}
                    onCheckedChange={(checked) => setFilters({...filters, featured: checked})}
                  />
                </div>

                <Button 
                  className="w-full"
                  onClick={() => setIsPopoverOpen(false)} 
                >
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </form>

      {/* Filter chips/badges */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 pb-1">
          <IconFilter 
            isActive={filters.category === "all"}
            onClick={() => handleCategorySelect("all")}
            icon={TrendingUp}
            label="All"
          />
          <IconFilter 
            isActive={filters.category === "restaurant"}
            onClick={() => handleCategorySelect("restaurant")}
            icon={Utensils}
            label="Dining"
          />
          <IconFilter 
            isActive={filters.category === "cafe"}
            onClick={() => handleCategorySelect("cafe")}
            icon={Coffee}
            label="Cafes"
          />
          {/* Add more filter options */}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SearchFilters;
