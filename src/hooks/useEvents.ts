
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event, Place } from '@/types';
import { useAuth } from './useAuthContext';
import { useToast } from './use-toast';

export function useEvents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Function to fetch all events
  async function fetchEvents() {
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!creator_id(*),
          participants_count:event_participants(count)
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;

      // Process the events to match our expected format
      const processedEvents = events.map(event => {
        // Handle creator data
        const creator = event.creator ? {
          full_name: event.creator.full_name || '',
          avatar_url: event.creator.avatar_url || ''
        } : undefined;

        // Handle participants count
        const participantsCount = event.participants_count?.[0]?.count || 0;

        return {
          ...event,
          creator,
          participants_count: participantsCount
        };
      });

      return processedEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  // Function to fetch a single event by ID with participants
  async function fetchEvent(eventId: string) {
    try {
      const { data: event, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!creator_id(*),
          participants:event_participants(
            *,
            user:profiles!user_id(*)
          )
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;

      // Process the event to match our expected format
      const creator = event.creator ? {
        full_name: event.creator.full_name || '',
        avatar_url: event.creator.avatar_url || ''
      } : undefined;

      // Format participants
      const participants = event.participants.map(participant => ({
        ...participant,
        user: participant.user || undefined
      }));

      return {
        ...event,
        creator,
        participants
      };
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      throw error;
    }
  }

  // Function to create a new event
  async function createEvent(eventData: Partial<Event>) {
    if (!user) {
      throw new Error('You must be logged in to create an event');
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          creator_id: user.id,
          status: 'active'
        })
        .select();

      if (error) throw error;
      
      return data[0];
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Function to update an existing event
  async function updateEvent(eventId: string, updates: Partial<Event>) {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .select();

      if (error) throw error;
      
      return data[0];
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Function to toggle participation in an event
  async function toggleEventParticipation(eventId: string, status: 'going' | 'maybe' | 'not_going') {
    if (!user) {
      throw new Error('You must be logged in to join an event');
    }

    try {
      // First check if the user is already a participant
      const { data: existingParticipant, error: checkError } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      let result;

      if (existingParticipant) {
        // Update existing participation
        const { data, error } = await supabase
          .from('event_participants')
          .update({ status })
          .eq('id', existingParticipant.id)
          .select(`
            *,
            user:profiles!user_id(*)
          `);
          
        if (error) throw error;
        result = data[0];
      } else {
        // Create new participation
        const { data, error } = await supabase
          .from('event_participants')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status
          })
          .select(`
            *,
            user:profiles!user_id(*)
          `);
          
        if (error) throw error;
        result = data[0];
      }

      // Process the result to match our expected format
      const processedResult = {
        ...result,
        user: result.user ? {
          full_name: result.user.full_name || '',
          avatar_url: result.user.avatar_url || ''
        } : undefined
      };

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      
      return processedResult;
    } catch (error) {
      console.error(`Error toggling participation for event ${eventId}:`, error);
      throw error;
    }
  }

  // Create custom hooks using React Query
  const useAllEvents = () => {
    return useQuery({
      queryKey: ['events'],
      queryFn: fetchEvents
    });
  };

  const useEvent = (eventId: string) => {
    return useQuery({
      queryKey: ['event', eventId],
      queryFn: () => fetchEvent(eventId),
      enabled: !!eventId
    });
  };

  const useCreateEvent = () => {
    return useMutation({
      mutationFn: createEvent,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        toast({
          title: "Event created",
          description: "Your event has been created successfully."
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Failed to create event",
          description: error instanceof Error ? error.message : "An unknown error occurred"
        });
      }
    });
  };

  const useUpdateEvent = () => {
    return useMutation({
      mutationFn: ({ eventId, updates }: { eventId: string; updates: Partial<Event> }) => 
        updateEvent(eventId, updates),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
        toast({
          title: "Event updated",
          description: "Your event has been updated successfully."
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Failed to update event",
          description: error instanceof Error ? error.message : "An unknown error occurred"
        });
      }
    });
  };

  const useToggleParticipation = () => {
    return useMutation({
      mutationFn: ({ eventId, status }: { eventId: string; status: 'going' | 'maybe' | 'not_going' }) => 
        toggleEventParticipation(eventId, status),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
        toast({
          title: "Participation updated",
          description: `You are now ${variables.status} to this event.`
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Failed to update participation",
          description: error instanceof Error ? error.message : "An unknown error occurred"
        });
      }
    });
  };

  return {
    useAllEvents,
    useEvent,
    useCreateEvent,
    useUpdateEvent,
    useToggleParticipation
  };
}
