
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Users, CreditCard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Place, ReservationData } from '@/types';

interface ReservationModalProps {
  place: Place;
  isOpen: boolean;
  onClose: () => void;
}

const timeSlots = [
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
];

const ReservationModal: React.FC<ReservationModalProps> = ({ place, isOpen, onClose }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>('');
  const [partySize, setPartySize] = useState<number>(2);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [waiveFee, setWaiveFee] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // In a real app, this would be determined by user status or app settings
  const isFirstReservation = true;
  const reservationFee = 5.00;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Create reservation data
    const reservationData: ReservationData = {
      placeId: place.id,
      date: date!,
      time,
      partySize,
      name,
      email,
      phone,
      notes,
      waiveFee
    };

    // In a real app, this would send a request to your server
    setTimeout(() => {
      console.log('Reservation submitted:', reservationData);
      setLoading(false);
      toast({
        title: "Reservation confirmed!",
        description: `Your reservation at ${place.name} on ${format(date!, 'PP')} at ${time} has been confirmed.`,
      });
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reserve at {place.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input 
              id="phone" 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
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
