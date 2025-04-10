
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Heart, User } from 'lucide-react';
import { useIsTablet, useIsDesktop } from '@/hooks/useMediaQuery';

const BottomNav = () => {
  const location = useLocation();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  
  // Don't show bottom nav on these routes or on tablet/desktop
  const hideNavRoutes = ['/location'];
  const shouldShowNav = !hideNavRoutes.includes(location.pathname) && !isTablet && !isDesktop;
  
  if (!shouldShowNav) return null;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 shadow-lg">
      <div className="flex justify-around items-center h-16">
        <NavItem to="/" icon={<Home />} label="Explore" />
        <NavItem to="/bookings" icon={<CalendarDays />} label="Bookings" />
        <NavItem to="/saved" icon={<Heart />} label="Saved" />
        <NavItem to="/profile" icon={<User />} label="Profile" />
      </div>
    </nav>
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
        `flex flex-col items-center w-full py-1 transition-all duration-200 ${
          isActive ? 'text-spotly-red scale-110' : 'text-muted-foreground'
        }`
      }
    >
      <div className={`h-6 w-6 mb-1 transition-transform ${
        location.pathname === to ? 'animate-bounce-once' : ''
      }`}>
        {icon}
      </div>
      <span className="text-xs">{label}</span>
    </NavLink>
  );
};

export default BottomNav;
