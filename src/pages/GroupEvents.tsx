
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import { usePlaces } from '@/hooks/usePlaces';
import { useAuth } from '@/hooks/useAuthContext';
import { Event, Place, IconFilterProps } from '@/types';
import CreateEventModal from '@/components/CreateEventModal';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarPlus, Calendar, Users, CalendarCheck, MapPin, FilePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { IconFilter } from '@/components/IconFilter';

const GroupEvents: React.FC = () => {
  const navigate = useNavigate();
  const { events, loading, upcomingEvents, pastEvents, fetchEvents } = useEvents();
  const { places } = usePlaces(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { requestPermission } = useNotifications();
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (events.length === 0 && !loading) {
      setShowNotifications(true);
    }
  }, [events, loading]);

  useEffect(() => {
    const checkPermission = async () => {
      const result = await requestPermission();
      // Compare with correct string type
      setShowNotifications(result === 'granted');
    };
    checkPermission();
  }, [requestPermission]);

  const handleCreateEvent = (newEvent: Event) => {
    toast({
      title: "Event Created",
      description: `${newEvent.title} has been successfully created.`,
    });
    
    fetchEvents();
  };

  const handleEventClick = (event: Event) => {
    // Navigate to event detail or open event modal
    console.log("Event clicked:", event);
  };

  const filteredUpcomingEvents = () => {
    if (selectedFilter === 'all') return upcomingEvents;
    if (selectedFilter === 'mine') return upcomingEvents.filter(event => event.creator_id === user?.id);
    if (selectedFilter === 'joined') {
      return upcomingEvents.filter(event => {
        return event.participants?.some(p => p.user_id === user?.id && p.status === 'going');
      });
    }
    return upcomingEvents;
  };

  const eventCount = events?.length || 0;
  const myEventsCount = events?.filter(event => event.creator_id === user?.id)?.length || 0;
  const joinedEventsCount = events?.filter(event => 
    event.participants?.some(p => p.user_id === user?.id && p.status === 'going')
  )?.length || 0;

  return (
    <div className="container px-4 py-6 pt-16 md:pt-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button onClick={() => setIsCreateEventModalOpen(true)}>
          <CalendarPlus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{eventCount}</CardTitle>
            <CardDescription>Total Events</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{myEventsCount}</CardTitle>
            <CardDescription>My Events</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <CalendarCheck className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{joinedEventsCount}</CardTitle>
            <CardDescription>Joined Events</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
        <IconFilter
          icon={Calendar}
          label="All"
          isActive={selectedFilter === 'all'}
          onClick={() => setSelectedFilter('all')}
        />
        <IconFilter
          icon={CalendarCheck}
          label="My Events"
          isActive={selectedFilter === 'mine'}
          onClick={() => setSelectedFilter('mine')}
        />
        <IconFilter
          icon={Users}
          label="Joined"
          isActive={selectedFilter === 'joined'}
          onClick={() => setSelectedFilter('joined')}
        />
      </div>

      <Tabs 
        defaultValue="upcoming" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredUpcomingEvents().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUpcomingEvents().map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  onEventClick={handleEventClick} 
                />
              ))}
            </div>
          ) : (
            <Card className="border border-dashed border-muted">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="rounded-full bg-muted p-3">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-3 text-lg font-medium">No Upcoming Events</h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs mt-1">
                  {selectedFilter !== 'all' 
                    ? `No ${selectedFilter === 'mine' ? 'events created by you' : 'events you joined'} found.` 
                    : "There are no upcoming events scheduled. Why not create a new one?"}
                </p>
                {selectedFilter === 'all' && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsCreateEventModalOpen(true)}
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : pastEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  onEventClick={handleEventClick} 
                />
              ))}
            </div>
          ) : (
            <Card className="border border-dashed border-muted">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="rounded-full bg-muted p-3">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-3 text-lg font-medium">No Past Events</h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs mt-1">
                  There's no history of past events yet. Events will appear here once they've passed.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {isCreateEventModalOpen && (
        <CreateEventModal
          isOpen={isCreateEventModalOpen}
          onClose={() => setIsCreateEventModalOpen(false)}
          onEventCreated={handleCreateEvent}
          places={places}
        />
      )}
    </div>
  );
};

export default GroupEvents;
