
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, Filter, Plus, Bell } from "lucide-react";
import EventCard from "@/components/EventCard";
import CreateEventModal from "@/components/CreateEventModal";
import EventDetailsModal from "@/components/EventDetailsModal";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from '@/hooks/useNotifications';
import { PushNotificationHelper } from '@/services/pushNotificationHelper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsDesktop } from '@/hooks/useMediaQuery';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  place_id: string;
  creator_id: string;
  status: string;
  max_participants: number;
  creator?: {
    full_name: string;
    avatar_url?: string;
  };
  place?: any; // You can define a proper type for place if needed
  participants_count?: number;
}

const GroupEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'upcoming' | 'my-events' | 'past'>('upcoming');
  const [scheduleNotification, setScheduleNotification] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const isDesktop = useIsDesktop();
  const { permissionStatus, requestPermission } = useNotifications();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Fetch upcoming events
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!creator_id(full_name, avatar_url),
          participants_count:event_participants(count)
        `)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (upcomingError) throw upcomingError;

      // Fetch past events
      const { data: pastData, error: pastError } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!creator_id(full_name, avatar_url),
          participants_count:event_participants(count)
        `)
        .lt('event_date', new Date().toISOString())
        .order('event_date', { ascending: false })
        .limit(10);

      if (pastError) throw pastError;
      
      let myEventsList: Event[] = [];
      
      if (user) {
        // Fetch events where user is a participant
        const { data: myData, error: myError } = await supabase
          .from('event_participants')
          .select(`
            event:events(
              *,
              creator:profiles!creator_id(full_name, avatar_url),
              participants_count:event_participants(count)
            )
          `)
          .eq('user_id', user.id);

        if (myError) throw myError;
        
        myEventsList = myData
          ?.map(item => item.event as Event)
          .filter(Boolean)
          .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()) || [];
      }
      
      // Process the data
      setEvents(upcomingData || []);
      setPastEvents(pastData || []);
      setMyEvents(myEventsList);
      
      // Schedule notifications for upcoming events
      if (permissionStatus === 'granted') {
        (upcomingData || []).forEach(event => {
          PushNotificationHelper.scheduleEventReminder(event);
        });
      }
    } catch (error: any) {
      console.error("Error loading events:", error);
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive"
      });
      
      // Use empty arrays as fallbacks
      setEvents([]);
      setPastEvents([]);
      setMyEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleEventCreated = (newEvent: Event) => {
    setEvents(prev => [newEvent, ...prev].sort((a, b) => 
      new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    ));
    
    if (scheduleNotification && permissionStatus === 'granted') {
      PushNotificationHelper.scheduleEventReminder(newEvent);
      toast({
        title: "Reminder scheduled",
        description: "You'll receive a notification before the event starts."
      });
    } else if (scheduleNotification && permissionStatus !== 'granted') {
      requestPermission().then(granted => {
        if (granted) {
          PushNotificationHelper.scheduleEventReminder(newEvent);
          toast({
            title: "Reminder scheduled",
            description: "You'll receive a notification before the event starts."
          });
        }
      });
    }
  };

  const handleOpenEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setDetailsModalOpen(true);
  };

  const handleEnableReminders = () => {
    requestPermission().then(granted => {
      if (granted) {
        // Schedule reminders for all upcoming events
        events.forEach(event => {
          PushNotificationHelper.scheduleEventReminder(event);
        });
        
        toast({
          title: "Event reminders enabled",
          description: "You'll receive notifications before events start."
        });
      }
    });
  };

  const filteredEvents = () => {
    switch (filter) {
      case 'my-events':
        return myEvents;
      case 'past':
        return pastEvents;
      case 'upcoming':
      default:
        return events;
    }
  };

  const displayEvents = filteredEvents();

  return (
    <div className={`pt-4 px-4 pb-20 ${isDesktop ? 'pt-[60px]' : ''}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Group Events</h1>
          <p className="text-muted-foreground">Find and join local experiences</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleEnableReminders}
            variant="outline"
            disabled={permissionStatus === 'granted'}
          >
            <Bell className="mr-2 h-4 w-4" />
            {permissionStatus === 'granted' ? 'Reminders Enabled' : 'Enable Reminders'}
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <Select
          value={filter}
          onValueChange={(value) => setFilter(value as any)}
        >
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter events" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming Events</SelectItem>
            <SelectItem value="my-events">My Events</SelectItem>
            <SelectItem value="past">Past Events</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 h-64 animate-pulse">
              <div className="w-2/3 h-4 bg-gray-200 rounded mb-4"></div>
              <div className="w-full h-24 bg-gray-200 rounded mb-4"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/3 h-4 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="w-1/4 h-8 bg-gray-200 rounded"></div>
                <div className="w-1/4 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : displayEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayEvents.map(event => (
            <EventCard 
              key={event.id}
              event={event}
              onClick={() => handleOpenEventDetails(event)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={
            filter === 'my-events'
              ? "You haven't joined any events"
              : filter === 'past'
              ? "No past events found"
              : "No upcoming events found"
          }
          description={
            filter === 'my-events'
              ? "Join an event or create your own to get started"
              : filter === 'past'
              ? "Check back later for past event history"
              : "Create an event to get started"
          }
          action={{
            label: "Create Event",
            onClick: () => setCreateModalOpen(true)
          }}
          className="py-12"
        />
      )}
      
      {createModalOpen && (
        <CreateEventModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onEventCreated={handleEventCreated}
          scheduleNotification={scheduleNotification}
          onToggleNotification={setScheduleNotification}
        />
      )}
      
      {selectedEvent && (
        <EventDetailsModal
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
          event={selectedEvent}
          onEventUpdated={fetchEvents}
        />
      )}
    </div>
  );
};

export default GroupEvents;
