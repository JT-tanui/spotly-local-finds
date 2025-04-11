
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, PlusCircle, Filter, ArrowDownAZ, MapPin, Clock, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Event } from '@/types';
import { supabase, mapDbEventToEvent } from '@/integrations/supabase/client';
import EventCard from '@/components/EventCard';
import CreateEventModal from '@/components/CreateEventModal';
import { useLocation } from '@/hooks/useLocation';
import { usePlaces } from '@/hooks/usePlaces';

type SortOption = 'recent' | 'date' | 'alphabetical';

const GroupEvents = () => {
  const navigate = useNavigate();
  const { location } = useLocation();
  const { allPlaces } = usePlaces(location);
  const { toast } = useToast();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [invitedEvents, setInvitedEvents] = useState<Event[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser?.user) {
        // For demo, load mock data if user is not authenticated
        const mockEvents: Event[] = [
          {
            id: '1',
            creator_id: 'mock-user',
            place_id: '1',
            title: 'Weekend Hiking Trip',
            description: 'Join us for a fun day hiking in the mountains!',
            event_date: new Date(Date.now() + 86400000 * 3).toISOString(),
            created_at: new Date().toISOString(),
            status: 'active',
            participants: [
              { id: '1', event_id: '1', user_id: 'mock-user', status: 'accepted', created_at: new Date().toISOString() },
              { id: '2', event_id: '1', user_id: 'friend1', status: 'accepted', created_at: new Date().toISOString() }
            ]
          },
          {
            id: '2',
            creator_id: 'friend1',
            place_id: '3',
            title: 'Coffee Meetup',
            description: 'Let\'s catch up over coffee',
            event_date: new Date(Date.now() + 86400000 * 1).toISOString(),
            created_at: new Date().toISOString(),
            status: 'active'
          }
        ];
        setEvents(mockEvents);
        setLoading(false);
        return;
      }
      
      // Fetch events with participants
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*');
        
      if (eventsError) throw eventsError;
      
      // Fetch participants for events
      const { data: participantsData, error: participantsError } = await supabase
        .from('event_participants')
        .select('*');
        
      if (participantsError) throw participantsError;
      
      // Map participants to their events
      const eventsWithParticipants = eventsData.map(event => {
        const eventParticipants = participantsData.filter(p => p.event_id === event.id);
        return { ...event, participants: eventParticipants };
      });
      
      // Enrich events with place data and ensure types match
      const enrichedEvents: Event[] = eventsWithParticipants.map(event => mapDbEventToEvent(event, allPlaces));
      
      setEvents(enrichedEvents);
      
      // Filter events created by current user
      const userCreatedEvents = enrichedEvents.filter(
        event => event.creator_id === currentUser.user.id
      );
      setMyEvents(userCreatedEvents);
      
      // Filter events user is invited to but didn't create
      const userInvitedEvents = enrichedEvents.filter(
        event => event.creator_id !== currentUser.user.id && 
        event.participants?.some(
          participant => participant.user_id === currentUser.user.id
        )
      );
      setInvitedEvents(userInvitedEvents);
      
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error fetching events",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sortEvents = (eventsToSort: Event[]) => {
    if (!eventsToSort.length) return [];
    
    const sorted = [...eventsToSort];
    
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => 
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        );
      case 'alphabetical':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'recent':
      default:
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  };
  
  const handleEventCreated = (newEvent: Event) => {
    setEvents(prev => [...prev, newEvent]);
    setMyEvents(prev => [...prev, newEvent]);
    fetchEvents(); // Refresh all data
    toast({
      title: "Event Created",
      description: "Your event was successfully created",
    });
  };
  
  const handleCreateEvent = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <div className="pt-[62px] pb-20 px-4">
      <h1 className="text-2xl font-bold mb-4">Group Events</h1>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <Button 
            size="sm" 
            variant={sortBy === 'date' ? 'default' : 'outline'}
            className="rounded-full text-xs"
            onClick={() => setSortBy('date')}
          >
            <Calendar className="w-3 h-3 mr-1" />
            By Date
          </Button>
          <Button 
            size="sm" 
            variant={sortBy === 'recent' ? 'default' : 'outline'}
            className="rounded-full text-xs"
            onClick={() => setSortBy('recent')}
          >
            <Clock className="w-3 h-3 mr-1" />
            Recent
          </Button>
          <Button 
            size="sm" 
            variant={sortBy === 'alphabetical' ? 'default' : 'outline'}
            className="rounded-full text-xs"
            onClick={() => setSortBy('alphabetical')}
          >
            <ArrowDownAZ className="w-3 h-3 mr-1" />
            A-Z
          </Button>
        </div>
        
        <Button onClick={handleCreateEvent} size="sm" className="rounded-full">
          <PlusCircle className="w-4 h-4 mr-1" />
          New Event
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="mine">My Events</TabsTrigger>
          <TabsTrigger value="invited">Invitations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {sortEvents(events).map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  places={allPlaces} 
                  onUpdateEvent={fetchEvents}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-background rounded-2xl border shadow-sm">
              <PartyPopper className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 font-medium">No events found</h3>
              <p className="text-sm text-muted-foreground">
                Create your first event or get invited to one
              </p>
              <Button 
                onClick={handleCreateEvent}
                variant="outline"
                className="mt-4 rounded-full"
              >
                Create Event
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="mine">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading your events...</p>
            </div>
          ) : myEvents.length > 0 ? (
            <div className="space-y-4">
              {sortEvents(myEvents).map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  places={allPlaces}
                  isOwner={true}
                  onUpdateEvent={fetchEvents}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-background rounded-2xl border shadow-sm">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 font-medium">You haven't created any events</h3>
              <p className="text-sm text-muted-foreground">
                Create your first event and invite friends
              </p>
              <Button 
                onClick={handleCreateEvent}
                variant="outline"
                className="mt-4 rounded-full"
              >
                Create Event
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="invited">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading your invitations...</p>
            </div>
          ) : invitedEvents.length > 0 ? (
            <div className="space-y-4">
              {sortEvents(invitedEvents).map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  places={allPlaces}
                  onUpdateEvent={fetchEvents}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-background rounded-2xl border shadow-sm">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 font-medium">No invitations yet</h3>
              <p className="text-sm text-muted-foreground">
                When you're invited to events, they'll appear here
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onEventCreated={handleEventCreated}
          places={allPlaces}
        />
      )}
    </div>
  );
};

export default GroupEvents;
