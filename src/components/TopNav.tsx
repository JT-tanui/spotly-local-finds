
import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, CalendarDays, Users, User, Search, 
  MapPin, LogOut, Menu, X 
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

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { location: userLocation } = useLocationHook();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSearch = () => setIsSearchVisible(!isSearchVisible);

  // Mock user - would normally come from auth context
  const user = {
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "https://i.pravatar.cc/150?img=23"
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b shadow-sm">
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <NavLink to="/" className="text-xl font-bold text-spotly-red">
            Spotly
          </NavLink>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavItem to="/" icon={<Home size={18} />} label="Explore" />
          <NavItem to="/bookings" icon={<CalendarDays size={18} />} label="Bookings" />
          <NavItem to="/events" icon={<Users size={18} />} label="Events" />
        </nav>

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

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden md:flex">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
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
    </header>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
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
    </NavLink>
  );
};

interface MobileMenuItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const MobileMenuItem: React.FC<MobileMenuItemProps> = ({ to, icon, label, onClick }) => {
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
    </NavLink>
  );
};

export default TopNav;
