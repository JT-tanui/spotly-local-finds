
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isAfter } from 'date-fns';
import { CalendarClock, Calendar, Award, Check, Clock, XCircle, MoreHorizontal } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Reservation, Ticket } from '@/types';
import { useAuth } from '@/hooks/useAuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/EmptyState';

// Mock reservations & tickets data - in real app would come from an API
const mockReservations: Reservation[] = [
  {
    id: '1',
    placeId: 'place1',
    placeName: 'Le Petite Bistro',
    placeImage: 'https://i.pravatar.cc/150?img=10',
    date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    time: '19:30',
    partySize: 2,
    status: 'confirmed'
  },
  {
    id: '2',
    placeId: 'place2',
    placeName: 'Sushi Heaven',
    placeImage: 'https://i.pravatar.cc/150?img=35',
    date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
    time: '18:00',
    partySize: 4,
    status: 'pending'
  },
  {
    id: '3',
    placeId: 'place3',
    placeName: 'Burger Joint',
    placeImage: 'https://i.pravatar.cc/150?img=50',
    date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    time: '12:30',
    partySize: 2,
    status: 'completed'
  },
  {
    id: '4',
    placeId: 'place4',
    placeName: 'Pizza Palace',
    placeImage: 'https://i.pravatar.cc/150?img=15',
    date: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    time: '19:00',
    partySize: 6,
    status: 'cancelled'
  }
];

const mockTickets: Ticket[] = [
  {
    id: '1',
    eventId: 'event1',
    eventName: 'Jazz Night',
    eventImage: 'https://i.pravatar.cc/150?img=20',
    eventDate: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
    purchaseDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    price: 25,
    status: 'active',
    ticketType: 'General Admission'
  },
  {
    id: '2',
    eventId: 'event2',
    eventName: 'Wine Tasting',
    eventImage: 'https://i.pravatar.cc/150?img=30',
    eventDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    purchaseDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    price: 40,
    status: 'active',
    ticketType: 'Premium'
  },
  {
    id: '3',
    eventId: 'event3',
    eventName: 'Dance Performance',
    eventImage: 'https://i.pravatar.cc/150?img=40',
    eventDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    purchaseDate: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
    price: 30,
    status: 'expired',
    ticketType: 'General Admission'
  }
];

const Bookings = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('reservations');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user && !authLoading) {
      navigate('/auth');
    }
  }, [user, navigate, authLoading]);

  // Simulate loading state
  React.useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter reservations by status
  const upcomingReservations = reservations.filter(
    res => res.status === 'confirmed' || res.status === 'pending'
  );
  
  const pastReservations = reservations.filter(
    res => res.status === 'completed' || res.status === 'cancelled'
  );

  // Filter tickets by status/date
  const activeTickets = tickets.filter(ticket => {
    if (ticket.status === 'expired' || ticket.status === 'used') return false;
    return isAfter(new Date(ticket.eventDate), new Date());
  });
  
  const pastTickets = tickets.filter(ticket => {
    if (ticket.status === 'expired' || ticket.status === 'used') return true;
    return !isAfter(new Date(ticket.eventDate), new Date());
  });

  // Handle reservation cancellation
  const handleCancelReservation = (id: string) => {
    setReservations(prev => 
      prev.map(res => 
        res.id === id ? { ...res, status: 'cancelled' } : res
      )
    );
  };

  if (authLoading || loading) {
    return (
      <div className="container px-4 py-6 pt-16 pb-20 md:pb-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-32 mb-6" />
        <div className="space-y-4">
          {Array(3).fill(null).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-6 pt-16 pb-20 md:pb-6 max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 pt-16 pb-20 md:pb-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Bookings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-6">
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="tickets">Event Tickets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reservations" className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-3">Upcoming Reservations</h2>
            {upcomingReservations.length > 0 ? (
              <div className="space-y-4">
                {upcomingReservations.map(reservation => (
                  <Card key={reservation.id} className="overflow-hidden">
                    <div className="flex">
                      <div className="w-24 h-24 sm:w-36 sm:h-36 overflow-hidden">
                        <img 
                          src={reservation.placeImage} 
                          alt={reservation.placeName} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="flex-1 p-4 sm:p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-base sm:text-lg">{reservation.placeName}</h3>
                            <div className="flex items-center text-muted-foreground mt-1">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs sm:text-sm">
                                {format(new Date(reservation.date), 'EEEE, MMMM d, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center text-muted-foreground mt-1">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs sm:text-sm">{reservation.time}</span>
                            </div>
                            <div className="mt-2">
                              <Badge variant={reservation.status === 'confirmed' ? 'default' : 'outline'}>
                                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          <Badge variant="outline" className="hidden sm:flex">
                            {reservation.partySize} {reservation.partySize === 1 ? 'person' : 'people'}
                          </Badge>
                        </div>
                      </CardContent>
                    </div>
                    <CardFooter className="flex justify-between bg-muted/50 px-4 py-3">
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/place/${reservation.placeId}`)}
                      >
                        View Place
                      </Button>
                      <div className="flex gap-2">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => {/* Navigate to modify reservation */}}
                        >
                          Modify
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleCancelReservation(reservation.id)}
                            >
                              Cancel Reservation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<CalendarClock className="h-12 w-12 text-muted-foreground" />}
                title="No upcoming reservations"
                description="When you make a reservation at a restaurant or venue, it will appear here."
                action={
                  <Button onClick={() => navigate('/')}>Explore Places</Button>
                }
              />
            )}
          </div>
          
          {pastReservations.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium mb-3">Past Reservations</h2>
              <div className="space-y-4">
                {pastReservations.map(reservation => (
                  <Card key={reservation.id} className="overflow-hidden">
                    <div className="flex">
                      <div className="w-24 h-24 sm:w-36 sm:h-36 overflow-hidden">
                        <img 
                          src={reservation.placeImage} 
                          alt={reservation.placeName} 
                          className="w-full h-full object-cover opacity-70"
                        />
                      </div>
                      <CardContent className="flex-1 p-4 sm:p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-base sm:text-lg">{reservation.placeName}</h3>
                            <div className="flex items-center text-muted-foreground mt-1">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs sm:text-sm">
                                {format(new Date(reservation.date), 'EEEE, MMMM d, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center text-muted-foreground mt-1">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs sm:text-sm">{reservation.time}</span>
                            </div>
                            <div className="mt-2">
                              <Badge 
                                variant={reservation.status === 'completed' ? 'secondary' : 'outline'}
                                className="opacity-70"
                              >
                                {reservation.status === 'completed' && <Check className="h-3 w-3 mr-1" />}
                                {reservation.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          <Badge variant="outline" className="hidden sm:flex opacity-70">
                            {reservation.partySize} {reservation.partySize === 1 ? 'person' : 'people'}
                          </Badge>
                        </div>
                      </CardContent>
                    </div>
                    <CardFooter className="flex justify-between bg-muted/50 px-4 py-3">
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/place/${reservation.placeId}`)}
                      >
                        View Place
                      </Button>
                      {reservation.status === 'completed' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {/* Add review logic */}}
                        >
                          Leave Review
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="tickets" className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-3">Upcoming Events</h2>
            {activeTickets.length > 0 ? (
              <div className="space-y-4">
                {activeTickets.map(ticket => (
                  <Card key={ticket.id} className="overflow-hidden">
                    <div className="flex">
                      <div className="w-24 h-24 sm:w-36 sm:h-36 overflow-hidden">
                        <img 
                          src={ticket.eventImage} 
                          alt={ticket.eventName} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="flex-1 p-4 sm:p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-base sm:text-lg">{ticket.eventName}</h3>
                            <div className="flex items-center text-muted-foreground mt-1">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs sm:text-sm">
                                {format(new Date(ticket.eventDate), 'EEEE, MMMM d, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center text-muted-foreground mt-1">
                              <Award className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs sm:text-sm">{ticket.ticketType}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="default">
                                Active
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                ${ticket.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                    <CardFooter className="flex justify-between bg-muted/50 px-4 py-3">
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => {/* View event details */}}
                      >
                        View Event
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => {/* Show ticket QR code */}}
                      >
                        View Ticket
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<CalendarClock className="h-12 w-12 text-muted-foreground" />}
                title="No upcoming event tickets"
                description="When you purchase tickets to events, they will appear here."
                action={
                  <Button onClick={() => navigate('/events')}>Find Events</Button>
                }
              />
            )}
          </div>
          
          {pastTickets.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium mb-3">Past Events</h2>
              <div className="space-y-4">
                {pastTickets.map(ticket => (
                  <Card key={ticket.id} className="overflow-hidden">
                    <div className="flex">
                      <div className="w-24 h-24 sm:w-36 sm:h-36 overflow-hidden">
                        <img 
                          src={ticket.eventImage} 
                          alt={ticket.eventName} 
                          className="w-full h-full object-cover opacity-70"
                        />
                      </div>
                      <CardContent className="flex-1 p-4 sm:p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-base sm:text-lg">{ticket.eventName}</h3>
                            <div className="flex items-center text-muted-foreground mt-1">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs sm:text-sm">
                                {format(new Date(ticket.eventDate), 'EEEE, MMMM d, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center text-muted-foreground mt-1">
                              <Award className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs sm:text-sm">{ticket.ticketType}</span>
                            </div>
                            <div className="mt-2">
                              <Badge 
                                variant="outline"
                                className="opacity-70"
                              >
                                Expired
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                    <CardFooter className="flex justify-between bg-muted/50 px-4 py-3">
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => {/* View event details */}}
                      >
                        View Event
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Bookings;
