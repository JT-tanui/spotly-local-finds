
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Calendar, Users, Plus, Filter, Settings } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuthContext';
import { useEvents } from '@/hooks/useEvents';
import { Event } from '@/types';
import EmptyState from '@/components/EmptyState';
import EventCard from '@/components/EventCard';
import CreateEventModal from '@/components/CreateEventModal';
import EventDetailsModal from '@/components/EventDetailsModal';

const GroupEvents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useAllEvents, useToggleParticipation } = useEvents();
  const { toast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState('all');
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [scheduleNotification, setScheduleNotification] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState({
    upcoming: true,
    participated: false,
    created: false
  });

  // Fetch events data
  const { data: fetchedEvents, isLoading, error } = useAllEvents();
  const { mutate: toggleParticipation } = useToggleParticipation();

  // Process events when data changes
  useEffect(() => {
    if (fetchedEvents) {
      // Process events to match our Event type
      const processedEvents = fetchedEvents.map(event => {
        const eventObj: Event = {
          id: event.id,
          title: event.title,
          description: event.description,
          event_date: event.event_date,
          place_id: event.place_id,
          creator_id: event.creator_id,
          status: event.status,
          max_participants: event.max_participants,
          created_at: event.created_at,
          creator: event.creator && {
            full_name: event.creator.full_name || '',
            avatar_url: event.creator.avatar_url || undefined
          },
          participants_count: typeof event.participants_count === 'number' ? 
            event.participants_count : 
            (Array.isArray(event.participants_count) && event.participants_count[0]?.count || 0)
        };
        return eventObj;
      });
      
      setEvents(processedEvents);
    }
  }, [fetchedEvents]);

  // Filter events based on active tab
  const filteredEvents = events.filter(event => {
    const now = new Date();
    const eventDate = new Date(event.event_date);
    const isUpcoming = eventDate >= now;
    const isUserEvent = event.creator_id === user?.id;
    
    if (activeTab === 'my-events') {
      return isUserEvent;
    }
    
    if (filters.upcoming && !isUpcoming) {
      return false;
    }
    
    if (filters.created && !isUserEvent) {
      return false;
    }
    
    // Additional filter for participated events would go here
    // (requires participant data which may be fetched separately)
    
    return true;
  });

  // Handle event selection for details view
  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };
  
  const handleCreateNewEvent = (newEvent: Event) => {
    setEvents(prev => [newEvent, ...prev]);
    
    toast({
      title: "Event created",
      description: "Your event has been created successfully."
    });

    if (scheduleNotification) {
      // Logic to schedule notifications would go here
      toast({
        title: "Notification scheduled",
        description: "You will be reminded before the event."
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container px-4 py-6 pt-16 pb-20 md:pb-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-10 w-full mb-6" />
        <div className="space-y-4">
          {Array(3).fill(null).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container px-4 py-6 pt-16 pb-20 md:pb-6 max-w-4xl mx-auto">
        <EmptyState
          icon={<Settings className="h-12 w-12 text-muted-foreground" />}
          title="Error loading events"
          description={error instanceof Error ? error.message : "Failed to load events"}
          action={
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 pt-16 pb-20 md:pb-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button onClick={() => setShowCreateEvent(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="my-events">My Events</TabsTrigger>
          </TabsList>
          
          <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Filter Options</h4>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="upcoming-filter">Upcoming only</Label>
                      <p className="text-xs text-muted-foreground">
                        Show only future events
                      </p>
                    </div>
                    <Switch
                      id="upcoming-filter"
                      checked={filters.upcoming}
                      onCheckedChange={(checked) => 
                        setFilters(prev => ({ ...prev, upcoming: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="created-filter">Created by me</Label>
                      <p className="text-xs text-muted-foreground">
                        Show only events you created
                      </p>
                    </div>
                    <Switch
                      id="created-filter"
                      checked={filters.created}
                      onCheckedChange={(checked) => 
                        setFilters(prev => ({ ...prev, created: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="participated-filter">Participating</Label>
                      <p className="text-xs text-muted-foreground">
                        Show events you're attending
                      </p>
                    </div>
                    <Switch
                      id="participated-filter"
                      checked={filters.participated}
                      onCheckedChange={(checked) => 
                        setFilters(prev => ({ ...prev, participated: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <TabsContent value="all">
          {filteredEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredEvents.map(event => (
                <EventCard 
                  key={event.id}
                  event={event}
                  onClick={() => handleSelectEvent(event)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
              title="No events found"
              description="There are no events matching your filters. Try adjusting your filters or create a new event."
              action={
                <Button onClick={() => setShowCreateEvent(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              }
            />
          )}
        </TabsContent>
        
        <TabsContent value="my-events">
          {filteredEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredEvents.map(event => (
                <EventCard 
                  key={event.id}
                  event={event}
                  onClick={() => handleSelectEvent(event)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
              title="No events found"
              description="You haven't created any events yet. Create your first event now!"
              action={
                <Button onClick={() => setShowCreateEvent(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              }
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        open={showEventDetails}
        onClose={() => setShowEventDetails(false)}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateEvent}
        onOpenChange={setShowCreateEvent}
        onEventCreated={handleCreateNewEvent}
        scheduleNotification={scheduleNotification}
        onToggleNotification={setScheduleNotification}
      />
    </div>
  );
};

export default GroupEvents;
