
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Event, Place, ParticipantData, EventDetailsModalProps } from '@/types';
import { MapPin, Calendar, User, Users, MessageSquare, Clock, Map, ExternalLink, Edit, Trash } from 'lucide-react';
import { useAuth } from "@/hooks/useAuthContext";
import { useEvents } from "@/hooks/useEvents";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatDate } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ 
  open, 
  onClose, 
  event, 
  place,
  isOwner,
  onUpdateEvent
}) => {
  const { user } = useAuth();
  const { joinEvent, leaveEvent, deleteEvent } = useEvents();
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    if (event && event.participants) {
      // Make sure we handle the right type here
      const typedParticipants = event.participants.map(p => ({
        ...p,
        user: p.user || { full_name: 'Unknown User' }
      })) as ParticipantData[];
      
      setParticipants(typedParticipants);
      
      // Find the current user's status
      if (user) {
        const userParticipation = typedParticipants.find(p => p.user_id === user.id);
        setUserStatus(userParticipation ? userParticipation.status : null);
      }
    }
  }, [event, user]);

  const handleAction = async (action: string) => {
    if (!user || !event) return;
    
    setLoading(true);
    try {
      if (action === 'join') {
        await joinEvent(event.id, 'going');
        toast({
          title: "You joined the event!",
          description: `You are now going to ${event.title}`,
        });
      } else if (action === 'leave') {
        await leaveEvent(event.id);
        toast({
          title: "You left the event",
          description: `You are no longer participating in ${event.title}`,
        });
      }
      onUpdateEvent();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${action} event: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    
    setLoading(true);
    try {
      await deleteEvent(event.id);
      onClose();
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!event || !place) return null;

  const eventDate = new Date(event.event_date);
  const isPastEvent = eventDate < new Date();
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          {place.imageUrl && (
            <div className="relative h-40 w-full overflow-hidden rounded-md">
              <img 
                src={place.imageUrl} 
                alt={place.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <h3 className="text-white font-medium">{place.name}</h3>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm">{place.address}</span>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm">{formatDate(event.event_date)}</span>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span className="text-sm">
                {event.participants_count || participants.length} attending 
                {event.max_participants ? ` (max ${event.max_participants})` : ''}
              </span>
            </div>
            
            {event.creator && (
              <div className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 mr-2" />
                <span className="text-sm">Organized by {event.creator.full_name}</span>
              </div>
            )}
          </div>
          
          {event.description && (
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          )}
          
          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium mb-2">Participants</h4>
            <div className="flex flex-wrap gap-2">
              {participants.length > 0 ? (
                participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-2 bg-secondary rounded-full pl-1 pr-3 py-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={participant.user?.avatar_url} />
                      <AvatarFallback>{participant.user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{participant.user?.full_name}</span>
                    <Badge variant="outline" className="text-[10px] h-4">{participant.status}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No participants yet</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-between pt-4 border-t">
            {isOwner ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={loading}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={loading}>
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Event</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this event? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={loading}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <>
                {userStatus ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAction('leave')}
                    disabled={loading || isPastEvent}
                  >
                    Leave Event
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => handleAction('join')}
                    disabled={loading || isPastEvent || (event.max_participants !== null && event.participants_count !== undefined && event.participants_count >= event.max_participants)}
                  >
                    Join Event
                  </Button>
                )}
              </>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={`https://maps.google.com/?q=${place.location.lat},${place.location.lng}`} target="_blank" rel="noopener noreferrer">
                  <Map className="h-4 w-4 mr-1" />
                  View Map
                </a>
              </Button>
              {place.website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={place.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;
