
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, CalendarDays, Users, MessageSquare, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocationHook } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import NavItem from './navigation/NavItem';
import UserMenu from './navigation/UserMenu';
import LocationButton from './navigation/LocationButton';
import SearchToggle from './navigation/SearchToggle';
import MobileMenu from './navigation/MobileMenu';
import ViewModeTabs from './navigation/ViewModeTabs';

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { location: userLocation } = useLocationHook();
  const { user } = useAuth();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(3); // Example unread count
  const [viewMode, setViewMode] = useState('standard');

  const toggleSearch = () => setIsSearchVisible(!isSearchVisible);
  
  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    // You could persist this preference or update relevant state
  };

  const isHome = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b shadow-sm">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')} 
              className="text-xl font-bold text-spotly-red"
            >
              Dinex
            </button>
          </div>

          {/* View Mode Toggle - Only visible on home page */}
          {isHome && (
            <div className="hidden md:flex justify-center flex-1">
              <ViewModeTabs 
                viewMode={viewMode}
                onChange={handleViewModeChange}
              />
            </div>
          )}

          {/* Desktop Navigation - not on home page */}
          {!isHome && (
            <nav className="hidden md:flex items-center space-x-1 flex-1 justify-center">
              <NavItem to="/" icon={<Home size={18} />} label="Explore" />
              <NavItem to="/bookings" icon={<CalendarDays size={18} />} label="Bookings" />
              <NavItem to="/events" icon={<Users size={18} />} label="Events" />
              <NavItem 
                to="/inbox" 
                icon={<MessageSquare size={18} />} 
                label="Inbox" 
                badge={unreadMessages > 0 ? unreadMessages : undefined} 
              />
            </nav>
          )}

          {/* Right side items */}
          <div className="flex items-center space-x-2">
            {/* Location button */}
            <LocationButton location={userLocation} />
            
            {/* Search toggle */}
            <SearchToggle 
              isVisible={isSearchVisible}
              onToggle={toggleSearch}
            />

            {/* Theme toggle */}
            <ThemeToggle />

            {/* User dropdown */}
            <UserMenu 
              user={user}
              unreadMessages={unreadMessages}
            />

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Expandable search bar - now handled by SearchToggle component */}
        
        {/* Mobile menu */}
        <MobileMenu 
          isOpen={isMobileMenuOpen}
          isHome={isHome}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          unreadMessages={unreadMessages}
          onMenuItemClick={() => setIsMobileMenuOpen(false)}
        />
      </div>
    </header>
  );
};

export default TopNav;
