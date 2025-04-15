import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, User, Users, MessageSquare, Clock, Map, ExternalLink, Edit, Trash } from 'lucide-react';
import { Event, Place } from '@/types';
import { useAuth } from "@/hooks/useAuthContext";
import { usePlaces } from '@/hooks/usePlaces';
import EventDetailsModal from '@/components/EventDetailsModal';
import { formatDate } from '@/integrations/supabase/client';

interface EventCardProps {
  event: Event;
  onEventClick?: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEventClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { places } = usePlaces();
  const [place, setPlace] = useState<Place | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const isUserCreator = user?.id === event.creator_id;

  useEffect(() => {
    if (event.place_id && places) {
      const foundPlace = places.find(p => p.id === event.place_id);
      setPlace(foundPlace || null);
    }
  }, [event.place_id, places]);
  
  const handleUpdateEvent = () => {
    // Refresh event details or refetch events
    console.log("Event updated, refreshing data...");
  };
  
  return (
    <Card
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow animate-fade-in cursor-pointer"
      onClick={() => setShowDetails(true)}
    >
      {place?.imageUrl && (
        <div className="relative h-32">
          <img
            src={place.imageUrl}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 right-0 bg-black/60 text-white text-xs px-2 py-1 rounded-bl-lg">
            {place.distance} km
          </div>
        </div>
      )}
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold truncate">{event.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </CardDescription>
        <div className="flex items-center text-muted-foreground mt-2">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="text-xs">{formatDate(event.event_date)}</span>
        </div>
        <div className="flex items-center text-muted-foreground mt-1">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="text-xs">{place?.name}</span>
        </div>
      </CardContent>
      
      <EventDetailsModal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        event={event}
        place={place as Place}
        isOwner={isUserCreator}
        onUpdateEvent={handleUpdateEvent}
      />
    </Card>
  );
};

export default EventCard;
