
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';
import { useAuth } from './useAuthContext';
import { useToast } from './use-toast';
import { mapDbEventToEvent } from '@/integrations/supabase/client';

export function useEvents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all upcoming events
  const { 
    data: upcomingEvents, 
    isLoading: isLoadingUpcoming, 
    error: upcomingError 
  } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!creator_id(full_name, avatar_url),
          participants:event_participants(*)
        `)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      
      return data?.map(event => ({
        ...event,
        creator: event.creator,
        participants: event.participants,
        participants_count: event.participants?.length || 0
      })) as Event[];
    }
  });

  // Fetch past events
  const { 
    data: pastEvents, 
    isLoading: isLoadingPast, 
    error: pastError 
  } = useQuery({
    queryKey: ['events', 'past'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!creator_id(full_name, avatar_url),
          participants:event_participants(count)
        `)
        .lt('event_date', new Date().toISOString())
        .order('event_date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data as Event[];
    }
  });

  // Fetch user's events
  const { 
    data: myEvents, 
    isLoading: isLoadingMyEvents, 
    error: myEventsError 
  } = useQuery({
    queryKey: ['events', 'my', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          event:events(
            *,
            creator:profiles!creator_id(full_name, avatar_url),
            participants:event_participants(*)
          )
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const events = data
        ?.map(item => item.event as Event)
        .filter(Boolean)
        .sort((a, b) => 
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        );
      
      return events || [];
    },
    enabled: !!user?.id
  });

  // Create a new event
  const { mutate: createEvent, isPending: isCreating } = useMutation({
    mutationFn: async (newEvent: Omit<Event, 'id' | 'created_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const eventToCreate = {
        ...newEvent,
        creator_id: user.id
      };
      
      const { data, error } = await supabase
        .from('events')
        .insert(eventToCreate)
        .select('*, creator:profiles!creator_id(full_name, avatar_url)')
        .single();
      
      if (error) throw error;
      
      // Add creator as participant
      await supabase
        .from('event_participants')
        .insert({
          event_id: data.id,
          user_id: user.id,
          status: 'going'
        });
      
      return data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      toast({
        title: "Event created",
        description: "Your event has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create event. Please try again.",
      });
    }
  });

  // Join an event
  const { mutate: joinEvent } = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string, status: 'going' | 'maybe' | 'not_going' }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Check if already participating
      const { data: existing } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existing) {
        // Update status
        const { error } = await supabase
          .from('event_participants')
          .update({ status })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Create new participation
        const { error } = await supabase
          .from('event_participants')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      toast({
        title: "Event joined",
        description: "You have successfully joined the event.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to join event. Please try again.",
      });
    }
  });

  return {
    upcomingEvents,
    pastEvents,
    myEvents,
    isLoadingUpcoming,
    isLoadingPast,
    isLoadingMyEvents,
    upcomingError,
    pastError,
    myEventsError,
    createEvent,
    isCreating,
    joinEvent
  };
}
