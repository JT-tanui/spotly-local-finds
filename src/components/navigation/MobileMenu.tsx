
import React from 'react';
import { Home, CalendarDays, Users, User, MapPin, MessageSquare } from 'lucide-react';
import MobileMenuItem from './MobileMenuItem';
import ViewModeTabs from './ViewModeTabs';

interface MobileMenuProps {
  isOpen: boolean;
  isHome: boolean;
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  unreadMessages: number;
  onMenuItemClick: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  isHome, 
  viewMode, 
  onViewModeChange, 
  unreadMessages,
  onMenuItemClick 
}) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t bg-background animate-fade-in">
      <div className="py-2 px-4 space-y-1">
        {isHome && (
          <div className="flex justify-center py-2 mb-2">
            <ViewModeTabs 
              viewMode={viewMode} 
              onChange={onViewModeChange}
              isMobile={true}
            />
          </div>
        )}
        <MobileMenuItem 
          to="/" 
          icon={<Home size={18} />} 
          label="Explore" 
          onClick={onMenuItemClick} 
        />
        <MobileMenuItem 
          to="/bookings" 
          icon={<CalendarDays size={18} />} 
          label="Bookings" 
          onClick={onMenuItemClick} 
        />
        <MobileMenuItem 
          to="/events" 
          icon={<Users size={18} />} 
          label="Group Events" 
          onClick={onMenuItemClick} 
        />
        <MobileMenuItem 
          to="/inbox" 
          icon={<MessageSquare size={18} />} 
          label="Inbox" 
          onClick={onMenuItemClick} 
          badge={unreadMessages > 0 ? unreadMessages : undefined}
        />
        <MobileMenuItem 
          to="/profile" 
          icon={<User size={18} />} 
          label="Profile" 
          onClick={onMenuItemClick} 
        />
        <MobileMenuItem 
          to="/location" 
          icon={<MapPin size={18} />} 
          label="Change Location" 
          onClick={onMenuItemClick} 
        />
      </div>
    </div>
  );
};

export default MobileMenu;
