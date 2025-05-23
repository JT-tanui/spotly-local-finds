
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchToggleProps {
  isVisible: boolean;
  onToggle: () => void;
}

const SearchToggle: React.FC<SearchToggleProps> = ({ isVisible, onToggle }) => {
  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="hidden md:flex" 
        onClick={onToggle}
      >
        <Search size={18} />
      </Button>
      
      {isVisible && (
        <div className="border-t py-2 px-4 bg-background animate-fade-in">
          <div className="max-w-lg mx-auto flex">
            <Input 
              placeholder="Search for places..." 
              className="mr-2"
            />
            <Button>
              <Search size={16} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchToggle;
