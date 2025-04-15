
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Event, Place } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  // Fetch places from the hook if not provided as props
  const { places: placesFromHook } = usePlaces();
  const places = providedPlaces || placesFromHook || [];
  
  const timeOptions = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', 
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title for the event",
        variant: "destructive"
      });
      return;
    }
    
    if (!date) {
      toast({
        title: "Missing information",
        description: "Please select a date for the event",
        variant: "destructive"
      });
      return;
    }
    
    if (!time) {
      toast({
        title: "Missing information",
        description: "Please select a time for the event",
        variant: "destructive"
      });
      return;
    }
    
    if (!placeId) {
      toast({
        title: "Missing information",
        description: "Please select a location for the event",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Combine date and time for event_date
      const [hours, minutes] = time.split(':').map(Number);
      const eventDate = new Date(date);
      eventDate.setHours(hours, minutes);
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create an event",
          variant: "destructive"
        });
        return;
      }
      
      // Create the event
      const { data, error } = await supabase
        .from('events')
        .insert({
          creator_id: userData.user.id,
          place_id: placeId,
          title,
          description: description || null,
          event_date: eventDate.toISOString(),
          max_participants: maxParticipants ? parseInt(maxParticipants) : null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Also add the creator as a participant
      await supabase
        .from('event_participants')
        .insert({
          event_id: data.id,
          user_id: userData.user.id,
          status: 'accepted'
        });
      
      toast({
        title: "Event created",
        description: "Your event has been successfully created"
      });
      
      onEventCreated(data as unknown as Event);
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Failed to create event",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              placeholder="Enter a title for your event"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="place">Location</Label>
            <Select value={placeId} onValueChange={setPlaceId}>
              <SelectTrigger className="w-full">
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(currentDate) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return currentDate < today;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((timeOption) => (
                    <SelectItem key={timeOption} value={timeOption}>
                      {format(new Date(`2000-01-01T${timeOption}:00`), 'h:mm a')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Maximum Participants (Optional)</Label>
            <Input
              id="maxParticipants"
              type="number"
              placeholder="Leave empty for unlimited"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              min="1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add details about your event"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;
