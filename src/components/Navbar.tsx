
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, User, Menu, X } from 'lucide-react';
import { LocationData } from '@/types';

interface NavbarProps {
  location: LocationData | null;
  onLocationClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ location, onLocationClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-xl font-bold text-spotly-red">Spotly</span>
        </div>

        {/* Location button - always visible */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:ml-4 flex items-center text-spotly-dark" 
          onClick={onLocationClick}
        >
          <MapPin className="mr-1 h-4 w-4 text-spotly-red" />
          <span className="truncate max-w-[150px]">
            {location?.city || location?.address || "Set location"}
          </span>
        </Button>

        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Button variant="ghost">Explore</Button>
          <Button variant="ghost">Saved</Button>
          <Button variant="ghost">Bookings</Button>
          <Button variant="outline" size="icon">
            <User size={18} />
          </Button>
        </nav>
      </div>

      {/* Mobile navigation */}
      {isOpen && (
        <div className="md:hidden bg-background border-t">
          <div className="container mx-auto py-2 px-4 flex flex-col space-y-2">
            <Button variant="ghost" className="justify-start">Explore</Button>
            <Button variant="ghost" className="justify-start">Saved</Button>
            <Button variant="ghost" className="justify-start">Bookings</Button>
            <Button variant="ghost" className="justify-start">Profile</Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
