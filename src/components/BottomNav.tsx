
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Users, User, MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { Badge } from '@/components/ui/badge';

const BottomNav = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Don't show bottom nav on these routes or on tablet/desktop
  const hideNavRoutes = ['/location'];
  const shouldShowNav = !hideNavRoutes.includes(location.pathname) && isMobile;
  
  useEffect(() => {
    if (!user) return;
    
    // Get unread messages count
    const getUnreadCount = async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('read', false);
      
      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };
    
    getUnreadCount();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          if (!payload.new.read) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.old.read === false && payload.new.read === true) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  // Render empty div instead of null to maintain consistent hook execution
  if (!shouldShowNav) {
    return <div className="hidden"></div>;
  }
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 shadow-lg">
      <div className="flex justify-around items-center h-16">
        <NavItem to="/" icon={<Home />} label="Explore" />
        <NavItem to="/bookings" icon={<CalendarDays />} label="Bookings" />
        <NavItem to="/events" icon={<Users />} label="Events" />
        <NavItem 
          to="/inbox" 
          icon={<MessageSquare />} 
          label="Inbox" 
          badge={unreadCount > 0 ? unreadCount : undefined} 
        />
        <NavItem to="/profile" icon={<User />} label="Profile" />
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <NavLink 
      to={to} 
      className={`flex flex-col items-center w-full py-1 transition-all duration-200 ${
        isActive ? 'text-spotly-red scale-110' : 'text-muted-foreground'
      }`}
    >
      <div className={`h-6 w-6 mb-1 transition-transform relative ${
        isActive ? 'animate-bounce-once' : ''
      }`}>
        {icon}
        {badge !== undefined && (
          <Badge variant="destructive" className="absolute -top-2 -right-2 px-1 min-w-4 h-4 text-[10px] flex items-center justify-center">
            {badge > 99 ? '99+' : badge}
          </Badge>
        )}
      </div>
      <span className="text-xs">{label}</span>
    </NavLink>
  );
};

export default BottomNav;
