
import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Search, MapPin, Menu, X, Home, Calendar, Users, MessageSquare, Bell, 
  Heart, BookOpen, PanelRight, LogOut
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLocation as useLocationHook } from '@/hooks/useLocation';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuthContext';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface DinexHeaderProps {
  viewMode: string;
  onViewModeChange: (mode: string) => void;
}

const DinexHeader: React.FC<DinexHeaderProps> = ({ viewMode, onViewModeChange }) => {
  const navigate = useNavigate();
  const { location } = useLocationHook();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-background/90 backdrop-blur-md shadow-md' : 'bg-background'
    }`}>
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 
              className="text-2xl font-bold mr-2 bg-gradient-to-r from-spotly-red to-slate-400 bg-clip-text text-transparent cursor-pointer"
              onClick={() => navigate('/')}
            >
              Dinex
            </h1>
          </div>

          {/* Desktop Navigation - Central */}
          <div className="hidden md:flex flex-1 justify-center">
            <Tabs defaultValue={viewMode} value={viewMode} onValueChange={onViewModeChange} className="w-auto">
              <TabsList className="bg-muted/60">
                <TabsTrigger value="standard" className="px-6">
                  Elegant
                </TabsTrigger>
                <TabsTrigger value="discover" className="px-6">
                  Discover
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Right Side Items */}
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
              className="text-foreground hover:text-spotly-red"
            >
              <Search size={18} />
            </Button>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* User Menu - Desktop */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="hidden md:flex">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
                      <AvatarFallback className="bg-spotly-red text-white">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
                      <AvatarFallback className="bg-spotly-red text-white">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span>{user?.user_metadata?.full_name || 'User'}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Home className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/bookings')}>
                    <Calendar className="mr-2 h-4 w-4" />
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/events')}>
                    <Users className="mr-2 h-4 w-4" />
                    Group Events
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/saved')}>
                    <Heart className="mr-2 h-4 w-4" />
                    Saved Places
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/inbox')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="default" 
                size="sm"
                className="hidden md:flex bg-spotly-red hover:bg-spotly-red/90"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            )}

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Expandable search bar */}
        {isSearchVisible && (
          <div className="py-3 animate-fade-in border-t border-border/40">
            <div className="flex">
              <Input 
                placeholder="Search for restaurants, cafes, dishes..." 
                className="mr-2"
                autoFocus
              />
              <Button className="bg-spotly-red hover:bg-spotly-red/90">
                <Search size={16} className="mr-2" />
                Search
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background animate-fade-in">
          <div className="container max-w-6xl mx-auto px-4">
            {/* View Mode Toggle for Mobile */}
            <div className="py-4 border-b">
              <Tabs defaultValue={viewMode} value={viewMode} onValueChange={onViewModeChange} className="w-full">
                <TabsList className="w-full bg-muted/60">
                  <TabsTrigger value="standard" className="flex-1">Elegant</TabsTrigger>
                  <TabsTrigger value="discover" className="flex-1">Discover</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
              
            <nav className="py-4">
              <ul className="space-y-1">
                <MobileNavItem icon={<Home size={18} />} label="Explore" to="/" />
                <MobileNavItem icon={<Calendar size={18} />} label="Bookings" to="/bookings" />
                <MobileNavItem icon={<Users size={18} />} label="Group Events" to="/events" />
                <MobileNavItem icon={<MessageSquare size={18} />} label="Inbox" to="/inbox" />
                <MobileNavItem icon={<Heart size={18} />} label="Saved Places" to="/saved" />
                <MobileNavItem icon={<BookOpen size={18} />} label="My Orders" to="/orders" />
                <MobileNavItem icon={<MapPin size={18} />} label="Change Location" to="/location" />
                
                {isAuthenticated ? (
                  <li>
                    <Button 
                      variant="ghost"
                      className="w-full justify-start text-left font-normal px-3"
                      onClick={() => navigate('/profile')}
                    >
                      <Avatar className="h-5 w-5 mr-3">
                        <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
                        <AvatarFallback className="bg-spotly-red text-white text-xs">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      My Profile
                    </Button>
                  </li>
                ) : (
                  <li>
                    <Button 
                      className="w-full bg-spotly-red hover:bg-spotly-red/90 mt-4"
                      onClick={() => navigate('/auth')}
                    >
                      Sign In
                    </Button>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

interface MobileNavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ icon, label, to, badge }) => {
  const navigate = useNavigate();
  
  return (
    <li>
      <Button 
        variant="ghost"
        className="w-full justify-start text-left font-normal px-3"
        onClick={() => navigate(to)}
      >
        <span className="mr-3">{icon}</span>
        {label}
        {badge !== undefined && badge > 0 && (
          <Badge variant="destructive" className="ml-auto">
            {badge}
          </Badge>
        )}
      </Button>
    </li>
  );
};

export default DinexHeader;
