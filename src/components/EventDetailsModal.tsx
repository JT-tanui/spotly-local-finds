
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, MapPinIcon, UsersIcon, X, Check, Clock } from 'lucide-react';
import { Event, ParticipantData } from '@/types';
import { useAuth } from '@/hooks/useAuthContext';
import { useEvents } from '@/hooks/useEvents';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';

interface EventDetailsModalProps {
  event?: Event | null;
  open: boolean;
  onClose: () => void;
}

const EventDetailsModal = ({ event, open, onClose }: EventDetailsModalProps) => {
  const { user } = useAuth();
  const { useEvent, useToggleParticipation } = useEvents();
  const [activeTab, setActiveTab] = useState<string>('details');
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  
  // Fetch event details including participants
  const { data: eventDetails, isLoading } = useEvent(event?.id || '');
  const { mutate: toggleParticipation } = useToggleParticipation();

  // Update participants when event details change
  useEffect(() => {
    if (eventDetails?.participants) {
      // Ensure participants match the expected ParticipantData type
      const typedParticipants = eventDetails.participants.map(participant => ({
        id: participant.id,
        user_id: participant.user_id,
        event_id: participant.event_id,
        status: participant.status as 'going' | 'maybe' | 'not_going' | 'invited' | 'accepted' | 'declined',
        created_at: participant.created_at,
        user: participant.user
      }));
      
      setParticipants(typedParticipants);
    }
  }, [eventDetails]);

  const handleParticipation = (status: 'going' | 'maybe' | 'not_going') => {
    if (!event?.id) return;
    toggleParticipation({ eventId: event.id, status });
  };

  const userParticipation = participants.find(p => p.user_id === user?.id)?.status || null;

  if (!event) return null;

  const formattedDate = event.event_date 
    ? format(new Date(event.event_date), 'EEEE, MMMM d, yyyy · h:mm a')
    : 'Date not available';

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl font-bold">{event.title}</SheetTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="participants">
                  Participants ({participants.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                {event.place && (
                  <div className="aspect-video w-full overflow-hidden rounded-md mb-4">
                    <img
                      src={event.place.imageUrl || '/placeholder.svg'}
                      alt={event.place.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="text-sm">{formattedDate}</span>
                </div>
                
                {event.place && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPinIcon className="h-4 w-4" />
                    <span className="text-sm">{event.place.name} - {event.place.address}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UsersIcon className="h-4 w-4" />
                  <span className="text-sm">
                    {event.max_participants ? 
                      `${participants.length} / ${event.max_participants} participants` : 
                      `${participants.length} participants`}
                  </span>
                </div>

                {event.description && (
                  <div className="mt-4 text-sm">
                    <h4 className="font-medium mb-1">About this event</h4>
                    <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
                  </div>
                )}

                {event.creator && (
                  <div className="flex items-center gap-3 mt-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={event.creator.avatar_url || ''} 
                        alt={event.creator.full_name || 'Event creator'} 
                      />
                      <AvatarFallback>
                        {(event.creator.full_name || '').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-muted-foreground">Created by</p>
                      <p className="text-sm font-medium">{event.creator.full_name}</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="participants">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">People attending</h4>
                  
                  {participants.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No one has joined this event yet. Be the first!</p>
                  ) : (
                    <div className="space-y-2">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage 
                                src={participant.user?.avatar_url || ''} 
                                alt={participant.user?.full_name || ''} 
                              />
                              <AvatarFallback>
                                {participant.user?.full_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{participant.user?.full_name}</span>
                          </div>
                          <Badge variant={
                            participant.status === 'going' ? 'default' : 
                            participant.status === 'maybe' ? 'outline' : 'secondary'
                          }>
                            {participant.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {event.status === 'active' && user && (
              <SheetFooter className="flex-row gap-2 sm:justify-start">
                <Button
                  variant={userParticipation === 'going' ? 'default' : 'outline'}
                  onClick={() => handleParticipation('going')}
                >
                  <Check className="mr-2 h-4 w-4" />
                  I'm Going
                </Button>
                <Button
                  variant={userParticipation === 'maybe' ? 'default' : 'outline'}
                  onClick={() => handleParticipation('maybe')}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Maybe
                </Button>
                <Button
                  variant={userParticipation === 'not_going' ? 'default' : 'outline'}
                  onClick={() => handleParticipation('not_going')}
                >
                  <X className="mr-2 h-4 w-4" />
                  Can't Go
                </Button>
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default EventDetailsModal;
