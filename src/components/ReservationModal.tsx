
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Users, CreditCard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Place, ReservationData } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from '@/hooks/useLocation';
import { usePlaces } from '@/hooks/usePlaces';

interface ReservationModalProps {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
  onReservationCreated?: () => void;
}

const timeSlots = [
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
];

const ReservationModal: React.FC<ReservationModalProps> = ({ 
  place, 
  isOpen, 
  onClose, 
  onReservationCreated 
}) => {
  const { toast } = useToast();
  const { location } = useLocation();
  const { allPlaces } = usePlaces(location);
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>('');
  const [partySize, setPartySize] = useState<number>(2);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [waiveFee, setWaiveFee] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // In a real app, this would be determined by user status or app settings
  const isFirstReservation = true;
  const reservationFee = 5.00;
  
  useEffect(() => {
    if (place) {
      setSelectedPlaceId(place.id);
    }
  }, [place]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !selectedPlaceId) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to make a reservation",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Convert 12-hour time format to 24-hour for database
      const timeComponents = time.match(/(\d+):(\d+) (AM|PM)/);
      if (!timeComponents) {
        throw new Error("Invalid time format");
      }
      
      let hours = parseInt(timeComponents[1], 10);
      const minutes = parseInt(timeComponents[2], 10);
      const period = timeComponents[3];
      
      if (period === "PM" && hours < 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      
      // Create reservation date by combining date and time
      const reservationDate = new Date(date);
      reservationDate.setHours(hours, minutes);
      
      // Create reservation
      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          user_id: userData.user.id,
          place_id: selectedPlaceId,
          reservation_date: reservationDate.toISOString(),
          party_size: partySize,
          notes: notes || null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Reservation confirmed!",
        description: `Your reservation has been successfully created.`,
      });
      
      if (onReservationCreated) {
        onReservationCreated();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Reservation failed",
        description: error.message || "Failed to create reservation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {place ? `Reserve at ${place.name}` : 'Make a Reservation'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Place Selection (only if no place is provided) */}
          {!place && (
            <div className="space-y-2">
              <Label htmlFor="place">Select a Place</Label>
              <Select 
                value={selectedPlaceId || ''} 
                onValueChange={setSelectedPlaceId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a place" />
                </SelectTrigger>
                <SelectContent>
                  {allPlaces.map((place) => (
                    <SelectItem key={place.id} value={place.id}>
                      {place.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  id="date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => {
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    return date < now;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  id="time"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {time || <span>Select a time</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="grid grid-cols-2 gap-2 p-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={time === slot ? "default" : "outline"}
                      onClick={() => setTime(slot)}
                      className="w-full"
                      type="button"
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Party Size */}
          <div className="space-y-2">
            <Label htmlFor="partySize">Number of People</Label>
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPartySize(Math.max(1, partySize - 1))}
              >
                -
              </Button>
              <Input
                id="partySize"
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                className="w-16 mx-2 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPartySize(partySize + 1)}
              >
                +
              </Button>
              <Users className="ml-2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input 
              id="phone" 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Requests (Optional)</Label>
            <Input 
              id="notes" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Reservation Fee */}
          <div className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Reservation Fee</h3>
                {isFirstReservation && (
                  <p className="text-sm text-green-600">First reservation is free!</p>
                )}
              </div>
              {!isFirstReservation && <span>${reservationFee.toFixed(2)}</span>}
            </div>
            
            {!isFirstReservation && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="waiveFee"
                  checked={waiveFee}
                  onCheckedChange={(checked) => setWaiveFee(!!checked)}
                />
                <label
                  htmlFor="waiveFee"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Use my free reservation
                </label>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Reservation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationModal;
