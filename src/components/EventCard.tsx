
import React from 'react';
import { Event } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { MapPin, Calendar, Users, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthContext';

interface EventCardProps {
  event: Event;
  onEventClick?: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEventClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwner = event.creator_id === user?.id;
  
  const eventDate = parseISO(event.event_date);
  const participantsCount = event.participants_count || event.participants?.length || 0;
  
  const handleClick = () => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      navigate(`/events/${event.id}`);
    }
  };
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer" 
      onClick={handleClick}
    >
      {event.place?.imageUrl && (
        <div className="relative h-32 w-full">
          <img 
            src={event.place.imageUrl} 
            alt={event.place?.name || 'Event location'} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-2 left-3">
            <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm">
              {format(eventDate, 'MMM d, yyyy • h:mm a')}
            </Badge>
          </div>
          {isOwner && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500">Host</Badge>
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {event.description || 'No description provided'}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-1 space-y-1">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          <span>{format(eventDate, 'E, MMM d • h:mm a')}</span>
        </div>
        
        {event.place && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span className="truncate">{event.place.name}</span>
          </div>
        )}
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5 mr-1" />
          <span>
            {participantsCount} {participantsCount === 1 ? 'person' : 'people'} going
            {event.max_participants && ` (max ${event.max_participants})`}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 pb-3 border-t">
        <div className="flex items-center text-sm">
          {event.creator?.avatar_url ? (
            <Avatar className="h-5 w-5 mr-1">
              <AvatarImage src={event.creator.avatar_url} alt={event.creator?.full_name} />
              <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
            </Avatar>
          ) : (
            <User className="h-3.5 w-3.5 mr-1" />
          )}
          <span className="text-muted-foreground">
            Created by {event.creator?.full_name || 'Unknown'}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
