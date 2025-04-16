
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ThemeToggle from '@/components/ThemeToggle';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLocation as useLocationHook } from '@/hooks/useLocation';

interface DinexHeaderProps {
  viewMode: string;
  onViewModeChange: (mode: string) => void;
}

const DinexHeader: React.FC<DinexHeaderProps> = ({ viewMode, onViewModeChange }) => {
  const navigate = useNavigate();
  const { location } = useLocationHook();
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  return (
    <div className="w-full bg-background border-b shadow-sm">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold mr-2 bg-gradient-to-r from-spotly-red to-slate-400 bg-clip-text text-transparent">
              Dinex
            </h1>
          </div>

          <div className="flex-1 flex justify-center px-4">
            <Tabs defaultValue={viewMode} value={viewMode} onValueChange={onViewModeChange} className="w-auto">
              <TabsList className="bg-muted/60">
                <TabsTrigger value="standard" className="px-6">
                  Classic
                </TabsTrigger>
                <TabsTrigger value="discover" className="px-6">
                  Discover
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center space-x-2">
            {/* Location button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex items-center" 
              onClick={() => navigate('/location')}
            >
              <MapPin className="mr-1 h-4 w-4 text-spotly-red" />
              <span className="truncate max-w-[100px]">
                {location?.city || "Set location"}
              </span>
            </Button>
            
            {/* Search toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSearch}
              aria-label="Search"
            >
              <Search size={18} />
            </Button>

            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* Expandable search bar */}
        {isSearchVisible && (
          <div className="py-2 animate-fade-in">
            <div className="flex">
              <Input 
                placeholder="Search for restaurants, cafes, dishes..." 
                className="mr-2"
                autoFocus
              />
              <Button>
                <Search size={16} className="mr-2" />
                Search
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DinexHeader;
