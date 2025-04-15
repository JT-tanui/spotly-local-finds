
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Event, Place } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, isPast } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EventDetailsModal from './EventDetailsModal';

interface EventCardProps {
  event: Event;
  places: Place[];
  isOwner?: boolean;
  onUpdateEvent: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, places, isOwner = false, onUpdateEvent }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  
  // Find the place details
  const place = places.find(p => p.id === event.place_id) || {
    id: 'unknown',
    name: 'Unknown location',
    imageUrl: 'https://images.unsplash.com/photo-1518237353330-0f7657e8bb9a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
    address: '',
    category: 'other' as const,
    rating: 0,
    reviewCount: 0,
    location: { lat: 0, lng: 0 }
  };
  
  const isExpired = isPast(new Date(event.event_date));
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return isExpired ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    if (status === 'active' && isExpired) return 'Expired';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'E, MMM d • h:mm a');
  };
  
  const updateAttendanceStatus = async (status: 'accepted' | 'declined' | 'maybe') => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to update your attendance",
          variant: "destructive"
        });
        return;
      }

      // Check if the user is already a participant
      const { data: existingParticipant } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', event.id)
        .eq('user_id', userData.user.id)
        .single();

      if (existingParticipant) {
        // Update existing status
        const { error } = await supabase
          .from('event_participants')
          .update({ status })
          .eq('id', existingParticipant.id);

        if (error) throw error;
      } else {
        // Create new participant record
        const { error } = await supabase
          .from('event_participants')
          .insert({
            event_id: event.id,
            user_id: userData.user.id,
            status
          });

        if (error) throw error;
      }

      toast({
        title: "Status updated",
        description: `You've ${status} this event`
      });
      
      onUpdateEvent();
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Failed to update status",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleCancelEvent = async () => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'cancelled' })
        .eq('id', event.id);

      if (error) throw error;

      toast({
        title: "Event cancelled",
        description: "The event has been cancelled"
      });
      
      onUpdateEvent();
    } catch (error) {
      console.error('Error cancelling event:', error);
      toast({
        title: "Failed to cancel event",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden mb-4 bg-white">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-1/3 h-32">
            <img 
              src={place.imageUrl} 
              alt={place.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full sm:w-2/3 p-3">
            <div className="flex justify-between items-start">
              <h3 className="font-medium truncate">{event.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(event.status)}`}>
                {getStatusText(event.status)}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">{place.name}</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formatEventDate(event.event_date)}</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Users className="w-3 h-3 mr-1" />
              <span>
                {event.participants_count || 0} attendee{(event.participants_count || 0) !== 1 ? 's' : ''}
                {event.max_participants ? ` (max ${event.max_participants})` : ''}
              </span>
            </div>
            
            <div className="flex mt-3 justify-between items-center">
              <div className="space-x-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setShowDetails(true)}
                >
                  Details
                </Button>
                
                {!isOwner && event.status === 'active' && !isExpired && (
                  <>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="text-xs"
                      onClick={() => updateAttendanceStatus('accepted')}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Attend
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                      onClick={() => updateAttendanceStatus('declined')}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Decline
                    </Button>
                  </>
                )}
              </div>
              
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowDetails(true)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/place/${event.place_id}`)}>
                      View Location
                    </DropdownMenuItem>
                    {event.status === 'active' && !isExpired && (
                      <DropdownMenuItem onClick={handleCancelEvent}>
                        Cancel Event
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showDetails && (
        <EventDetailsModal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          event={event}
          place={place}
          isOwner={isOwner}
          onUpdateEvent={onUpdateEvent}
        />
      )}
    </>
  );
};

export default EventCard;
