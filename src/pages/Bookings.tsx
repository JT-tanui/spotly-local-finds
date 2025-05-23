import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/hooks/useAuthContext';
import TopNav from '@/components/TopNav';

interface Booking {
  id: string;
  place_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  guests: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  place_name: string;
  place_address: string;
  place_image_url: string;
}

const Bookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      try {
        // Mock bookings data
        const mockBookings: Booking[] = [
          {
            id: '1',
            place_id: '101',
            user_id: user.id,
            start_time: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
            end_time: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
            guests: 2,
            status: 'upcoming',
            place_name: 'The Cozy Cafe',
            place_address: '123 Main St, Anytown',
            place_image_url: 'https://source.unsplash.com/300x200/?cafe'
          },
          {
            id: '2',
            place_id: '102',
            user_id: user.id,
            start_time: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
            end_time: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
            guests: 4,
            status: 'upcoming',
            place_name: 'Gourmet Restaurant',
            place_address: '456 Elm St, Anytown',
            place_image_url: 'https://source.unsplash.com/300x200/?restaurant'
          },
          {
            id: '3',
            place_id: '103',
            user_id: user.id,
            start_time: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
            end_time: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
            guests: 2,
            status: 'completed',
            place_name: 'Local Pizzeria',
            place_address: '789 Oak St, Anytown',
            place_image_url: 'https://source.unsplash.com/300x200/?pizza'
          },
          {
            id: '4',
            place_id: '104',
            user_id: user.id,
            start_time: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
            end_time: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
            guests: 1,
            status: 'cancelled',
            place_name: 'Sushi Bar',
            place_address: '101 Pine St, Anytown',
            place_image_url: 'https://source.unsplash.com/300x200/?sushi'
          },
        ];

        setBookings(mockBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: "Error",
          description: "Failed to load bookings. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate, toast]);

  const handleModifyBooking = (bookingId: string) => {
    toast({
      title: "Modify Booking",
      description: `Modifying booking with ID: ${bookingId}`,
    });
  };

  const handleCancelBooking = (bookingId: string) => {
    toast({
      title: "Cancel Booking",
      description: `Cancelling booking with ID: ${bookingId}`,
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString(undefined, options);
  };

  const UpcomingBookings = () => {
    const upcoming = bookings.filter(booking => booking.status === 'upcoming');

    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {upcoming.map(booking => (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle>{booking.place_name}</CardTitle>
              <CardDescription>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {booking.place_address}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                {formatDate(booking.start_time)}
              </div>
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                {booking.guests} Guests
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Button onClick={() => navigate(`/place/${booking.place_id}`)}>
                View Place
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleModifyBooking(booking.id)}>
                    Modify
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCancelBooking(booking.id)}>
                    Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const PastBookings = () => {
    const past = bookings.filter(booking => booking.status === 'completed');

    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {past.map(booking => (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle>{booking.place_name}</CardTitle>
              <CardDescription>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {booking.place_address}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                {formatDate(booking.start_time)}
              </div>
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                {booking.guests} Guests
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Button onClick={() => navigate(`/place/${booking.place_id}`)}>
                View Place
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleModifyBooking(booking.id)}>
                    Modify
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCancelBooking(booking.id)}>
                    Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const CancelledBookings = () => {
    const cancelled = bookings.filter(booking => booking.status === 'cancelled');

    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {cancelled.map(booking => (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle>{booking.place_name}</CardTitle>
              <CardDescription>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {booking.place_address}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                {formatDate(booking.start_time)}
              </div>
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                {booking.guests} Guests
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Button onClick={() => navigate(`/place/${booking.place_id}`)}>
                View Place
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleModifyBooking(booking.id)}>
                    Modify
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCancelBooking(booking.id)}>
                    Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList>
            <TabsTrigger value="upcoming" onClick={() => setActiveTab('upcoming')}>Upcoming</TabsTrigger>
            <TabsTrigger value="past" onClick={() => setActiveTab('past')}>Past</TabsTrigger>
            <TabsTrigger value="cancelled" onClick={() => setActiveTab('cancelled')}>Cancelled</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <UpcomingBookings />
          </TabsContent>
          <TabsContent value="past">
            <PastBookings />
          </TabsContent>
          <TabsContent value="cancelled">
            <CancelledBookings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Bookings;
