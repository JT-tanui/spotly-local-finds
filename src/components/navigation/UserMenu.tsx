
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CalendarDays, Users, MessageSquare, LogOut } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface UserMenuProps {
  user?: {
    user_metadata?: {
      avatar_url?: string;
    };
  };
  unreadMessages: number;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, unreadMessages }) => {
  const navigate = useNavigate();

  return (
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
  );
};

export default UserMenu;
