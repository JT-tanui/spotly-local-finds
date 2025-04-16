
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { Event, Place } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { format, isFuture } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { usePlaces } from '@/hooks/usePlaces';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: Event) => void;
  places?: Place[];
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  places: providedPlaces
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  // Fetch places from the hook if not provided as props
  const { places: placesFromHook } = usePlaces(null);
  const places = providedPlaces || placesFromHook || [];
  
  const timeOptions = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setDate(undefined);
      setTime('');
      setPlaceId('');
      setMaxParticipants('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create an event.",
        variant: "destructive",
      });
      return;
    }
    
    if (!title || !date || !time || !placeId) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const eventDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${time}`);
    
    if (!isFuture(eventDateTime)) {
      toast({
        title: "Invalid date",
        description: "Event date must be in the future.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Create event in Supabase
      const { data, error } = await supabase
        .from('events')
        .insert({
          title,
          description,
          event_date: eventDateTime.toISOString(),
          place_id: placeId,
          creator_id: user.id,
          status: 'active',
          max_participants: maxParticipants ? parseInt(maxParticipants) : null,
        })
        .select('*, creator:profiles(*), place(*), participants(*, user:profiles(*))')
        .single();
      
      if (error) {
        throw error;
      }
      
      // Add creator as participant
      await supabase
        .from('event_participants')
        .insert({
          event_id: data.id,
          user_id: user.id,
          status: 'going',
        });
      
      // Fetch the complete event data with relations
      const { data: eventWithRelations, error: fetchError } = await supabase
        .from('events')
        .select('*, creator:profiles(*), place(*), participants:event_participants(*, user:profiles(*))')
        .eq('id', data.id)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Call the callback with the created event
      onEventCreated(eventWithRelations as unknown as Event);
      
      toast({
        title: "Event created",
        description: "Your event has been created successfully.",
      });
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event"
              rows={3}
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 grid gap-2">
              <Label htmlFor="date">Date *</Label>
              <DatePicker
                selected={date}
                onSelect={setDate}
                disabled={submitting}
                fromDate={new Date()}
              />
            </div>
            
            <div className="flex-1 grid gap-2">
              <Label htmlFor="time">Time *</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="place">Location *</Label>
            <Select value={placeId} onValueChange={setPlaceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {places && places.length > 0 ? (
                  places.map((place) => (
                    <SelectItem key={place.id} value={place.id}>
                      {place.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-places" disabled>
                    No locations available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="maxParticipants">Maximum participants (optional)</Label>
            <Input
              id="maxParticipants"
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              placeholder="Leave empty for unlimited"
              min="2"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="animate-spin mr-2">⚪</span>
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;
