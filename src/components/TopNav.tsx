
import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, CalendarDays, Users, User, Search, 
  MapPin, LogOut, Menu, X, MessageSquare, Bell, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useLocation as useLocationHook } from '@/hooks/useLocation';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuthContext';

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
            <NavLink to="/" className="text-xl font-bold text-spotly-red">
              Dinex
            </NavLink>
          </div>

          {/* View Mode Toggle - Only visible on home page */}
          {isHome && (
            <div className="hidden md:flex justify-center flex-1">
              <Tabs defaultValue={viewMode} value={viewMode} onValueChange={handleViewModeChange} className="w-auto">
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex items-center text-spotly-dark" 
              onClick={() => navigate('/location')}
            >
              <MapPin className="mr-1 h-4 w-4 text-spotly-red" />
              <span className="truncate max-w-[100px]">
                {userLocation?.city || userLocation?.address || "Set location"}
              </span>
            </Button>
            
            {/* Search toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex" 
              onClick={toggleSearch}
            >
              <Search size={18} />
            </Button>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="hidden md:flex">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      <User size={16} />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/bookings')}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Bookings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/events')}>
                  <Users className="mr-2 h-4 w-4" />
                  Group Events
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/inbox')}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Inbox
                  {unreadMessages > 0 && (
                    <Badge variant="destructive" className="ml-auto px-1 min-w-5 text-center">
                      {unreadMessages}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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

        {/* Expandable search bar */}
        {isSearchVisible && (
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

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background animate-fade-in">
            <div className="py-2 px-4 space-y-1">
              {isHome && (
                <div className="flex justify-center py-2 mb-2">
                  <Tabs defaultValue={viewMode} value={viewMode} onValueChange={handleViewModeChange} className="w-full">
                    <TabsList className="w-full bg-muted/60">
                      <TabsTrigger value="standard" className="flex-1">Classic</TabsTrigger>
                      <TabsTrigger value="discover" className="flex-1">Discover</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}
              <MobileMenuItem 
                to="/" 
                icon={<Home size={18} />} 
                label="Explore" 
                onClick={() => setIsMobileMenuOpen(false)} 
              />
              <MobileMenuItem 
                to="/bookings" 
                icon={<CalendarDays size={18} />} 
                label="Bookings" 
                onClick={() => setIsMobileMenuOpen(false)} 
              />
              <MobileMenuItem 
                to="/events" 
                icon={<Users size={18} />} 
                label="Group Events" 
                onClick={() => setIsMobileMenuOpen(false)} 
              />
              <MobileMenuItem 
                to="/inbox" 
                icon={<MessageSquare size={18} />} 
                label="Inbox" 
                onClick={() => setIsMobileMenuOpen(false)} 
                badge={unreadMessages > 0 ? unreadMessages : undefined}
              />
              <MobileMenuItem 
                to="/profile" 
                icon={<User size={18} />} 
                label="Profile" 
                onClick={() => setIsMobileMenuOpen(false)} 
              />
              <MobileMenuItem 
                to="/location" 
                icon={<MapPin size={18} />} 
                label="Change Location" 
                onClick={() => setIsMobileMenuOpen(false)} 
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, badge }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 rounded-md transition-colors ${
          isActive
            ? 'bg-slate-100 text-spotly-red font-medium'
            : 'text-spotly-dark hover:bg-slate-50'
        }`
      }
    >
      <span className="mr-1">{icon}</span>
      {label}
      {badge !== undefined && (
        <Badge variant="destructive" className="ml-1.5 px-1 min-w-5 text-center">
          {badge}
        </Badge>
      )}
    </NavLink>
  );
};

interface MobileMenuItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: number;
}

const MobileMenuItem: React.FC<MobileMenuItemProps> = ({ to, icon, label, onClick, badge }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-3 rounded-md ${
          isActive
            ? 'bg-slate-100 text-spotly-red font-medium'
            : 'text-spotly-dark'
        }`
      }
      onClick={onClick}
    >
      <span className="mr-3">{icon}</span>
      {label}
      {badge !== undefined && (
        <Badge variant="destructive" className="ml-auto px-1 min-w-5 text-center">
          {badge}
        </Badge>
      )}
    </NavLink>
  );
};

export default TopNav;
