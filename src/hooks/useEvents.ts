
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuthContext';
import { Event } from '@/types';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from './use-toast';

export function useEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<Event[]>([]);
  const userId = user?.id;
  
  const { isLoading: loading, error, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          participants:event_participants(
            *,
            user:user_id(
              id, 
              full_name, 
              avatar_url
            )
          )
        `)
        .order('event_date', { ascending: true });
        
      if (error) throw error;
      
      // Transform the data to match our Event type
      const formattedEvents: Event[] = data.map((event: any) => {
        // Format creator info
        let creator = undefined;
        if (event.user) {
          creator = {
            full_name: event.user.full_name,
            avatar_url: event.user.avatar_url
          };
        }
        
        return {
          ...event,
          creator,
          participants: event.participants || [],
          participants_count: event.participants?.length || 0
        };
      });
      
      setEvents(formattedEvents);
      return formattedEvents;
    },
    enabled: !!userId,
  });
  
  const fetchEvents = useCallback(() => {
    refetch();
  }, [refetch]);

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: Omit<Event, 'id' | 'created_at'>) => {
      if (!user) throw new Error('User must be authenticated');
      
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title || '',
          description: eventData.description,
          event_date: eventData.event_date,
          place_id: eventData.place_id,
          creator_id: user.id,
          status: eventData.status || 'active',
          max_participants: eventData.max_participants
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
  
  // Join event mutation
  const joinEventMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string, status: string }) => {
      if (!user) throw new Error('User must be authenticated');
      
      const { data, error } = await supabase
        .from('event_participants')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status
        })
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
  
  // Leave event mutation
  const leaveEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('User must be authenticated');
      
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('User must be authenticated');
      
      // Check if the user is the event creator
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
        
      if (eventError) throw eventError;
      
      if (eventData.creator_id !== user.id) {
        throw new Error('Only the event creator can delete this event');
      }
      
      // Delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const createEvent = async (eventData: Omit<Event, 'id' | 'created_at'>) => {
    try {
      return await createEventMutation.mutateAsync(eventData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create event",
        description: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  };
  
  const joinEvent = async (eventId: string, status = 'going') => {
    try {
      return await joinEventMutation.mutateAsync({ eventId, status });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to join event",
        description: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  };
  
  const leaveEvent = async (eventId: string) => {
    try {
      return await leaveEventMutation.mutateAsync(eventId);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to leave event",
        description: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  };
  
  const deleteEvent = async (eventId: string) => {
    try {
      return await deleteEventMutation.mutateAsync(eventId);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete event",
        description: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  };

  const upcomingEvents = events.filter(
    event => new Date(event.event_date) >= new Date()
  );
  
  const pastEvents = events.filter(
    event => new Date(event.event_date) < new Date()
  );

  return {
    events,
    upcomingEvents,
    pastEvents,
    loading,
    error,
    fetchEvents,
    createEvent,
    joinEvent,
    leaveEvent,
    deleteEvent
  };
}
