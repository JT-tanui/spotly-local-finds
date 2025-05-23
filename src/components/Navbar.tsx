
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, Menu, X, Bell, Home, CalendarDays, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/hooks/useLocation';
import { useNotifications } from '@/hooks/useNotifications';
import NavItem from './navigation/NavItem';
import MobileMenuItem from './navigation/MobileMenuItem';
import LocationButton from './navigation/LocationButton';
import { Badge } from "@/components/ui/badge";

const Navbar: React.FC<{
  location: any;
  onLocationClick?: () => void;
}> = ({ location, onLocationClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { permissionStatus, requestPermission } = useNotifications();
  const unreadMessages = 3; // Example unread count
  
  const handleLocationClick = () => {
    if (onLocationClick) {
      onLocationClick();
    } else {
      navigate('/location');
    }
  };

  const handleNotificationClick = () => {
    if (permissionStatus !== 'granted') {
      requestPermission();
    } else {
      // Navigate to notifications page or show notifications panel
      // For now, we'll just toggle mobile menu
      setIsOpen(!isOpen);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <span 
            className="text-xl font-bold text-spotly-red cursor-pointer" 
            onClick={() => navigate('/')}
          >
            Spotly
          </span>
        </div>

        {/* Location button - always visible */}
        <LocationButton 
          location={{
            city: location?.city,
            address: location?.address
          }}
        />

        {/* Notification button - visible on mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={handleNotificationClick}
        >
          <Bell size={20} />
          {permissionStatus !== 'granted' && (
            <Badge className="h-2 w-2 p-0 absolute top-2 right-2 bg-red-500"></Badge>
          )}
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
          <NavItem to="/" icon={<Home size={18} />} label="Explore" />
          <NavItem to="/bookings" icon={<CalendarDays size={18} />} label="Bookings" />
          <NavItem to="/saved" label="Saved" icon={<Users size={18} />} />
          <NavItem to="/events" label="Events" icon={<Users size={18} />} />
          <Button variant="outline" size="icon" onClick={() => navigate('/profile')}>
            <User size={18} />
          </Button>
        </nav>
      </div>

      {/* Mobile navigation */}
      {isOpen && (
        <div className="md:hidden bg-background border-t">
          <div className="container mx-auto py-2 px-4 flex flex-col space-y-2">
            <MobileMenuItem 
              to="/" 
              icon={<Home size={18} />} 
              label="Explore" 
              onClick={() => setIsOpen(false)} 
            />
            <MobileMenuItem 
              to="/bookings" 
              icon={<CalendarDays size={18} />} 
              label="Bookings" 
              onClick={() => setIsOpen(false)}
            />
            <MobileMenuItem 
              to="/saved" 
              icon={<Users size={18} />} 
              label="Saved" 
              onClick={() => setIsOpen(false)}
            />
            <MobileMenuItem 
              to="/events" 
              icon={<Users size={18} />} 
              label="Events" 
              onClick={() => setIsOpen(false)}
            />
            <MobileMenuItem 
              to="/inbox" 
              icon={<MessageSquare size={18} />} 
              label="Inbox" 
              onClick={() => setIsOpen(false)}
              badge={unreadMessages}
            />
            <MobileMenuItem 
              to="/profile" 
              icon={<User size={18} />} 
              label="Profile" 
              onClick={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
