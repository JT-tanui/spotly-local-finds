
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, AlertTriangle, Plus, Ticket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Reservation, Place, Ticket as TicketType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format, isPast } from 'date-fns';
import { usePlaces } from '@/hooks/usePlaces';
import { useLocation } from '@/hooks/useLocation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import ReservationModal from '@/components/ReservationModal';

// Type for tab values
type TabValue = 'reservations' | 'upcoming' | 'past' | 'tickets';

const Bookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { location } = useLocation();
  const { allPlaces } = usePlaces(location);
  const isMobile = useIsMobile();
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Reservation[]>([]);
  const [pastBookings, setPastBookings] = useState<Reservation[]>([]);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('reservations');
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  useEffect(() => {
    fetchReservationsAndTickets();
  }, []);

  const fetchReservationsAndTickets = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        loadMockData();
        return;
      }
      
      // Fetch reservations
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('reservation_date', { ascending: true });
        
      if (reservationsError) throw reservationsError;
      
      // Fetch tickets if the table exists
      let ticketsData: any[] = [];
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('event_date', { ascending: true });
        
        if (!error) {
          ticketsData = data || [];
        }
      } catch (ticketsError) {
        console.log('Tickets table may not exist yet:', ticketsError);
      }
      
      processReservations(reservationsData || []);
      processTickets(ticketsData);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: "Error fetching data",
        description: "Please try again later",
        variant: "destructive"
      });
      loadMockData(); // Fall back to mock data
    } finally {
      setLoading(false);
    }
  };
  
  const loadMockData = () => {
    // For demo, load mock data if user is not authenticated
    const mockReservations = [
      {
        id: '1',
        user_id: 'mock-user',
        place_id: '1',
        reservation_date: new Date('2025-04-15T13:00:00').toISOString(),
        party_size: 2,
        status: 'confirmed',
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        user_id: 'mock-user',
        place_id: '3',
        reservation_date: new Date('2025-04-20T20:30:00').toISOString(),
        party_size: 4,
        status: 'confirmed',
        notes: 'Window seat if possible',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        user_id: 'mock-user',
        place_id: '5',
        reservation_date: new Date('2025-03-10T11:00:00').toISOString(),
        party_size: 2,
        status: 'completed',
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        user_id: 'mock-user',
        place_id: '2',
        reservation_date: new Date('2025-03-01T15:00:00').toISOString(),
        party_size: 3,
        status: 'cancelled',
        notes: 'Had to cancel due to illness',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    const mockTickets = [
      {
        id: '1',
        user_id: 'mock-user',
        place_id: '4',
        event_date: new Date('2025-04-25T19:00:00').toISOString(),
        purchase_date: new Date().toISOString(),
        ticket_type: 'standard',
        price: 25,
        status: 'valid',
        qr_code: 'MOCK-QR-1234',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        user_id: 'mock-user',
        place_id: '6',
        event_date: new Date('2025-03-15T20:00:00').toISOString(),
        purchase_date: new Date().toISOString(),
        ticket_type: 'vip',
        price: 75,
        status: 'used',
        qr_code: 'MOCK-QR-5678',
        created_at: new Date().toISOString()
      }
    ];
    
    processReservations(mockReservations);
    processTickets(mockTickets);
  };
  
  const processReservations = (data: any[]) => {
    if (!data) return;
    
    const now = new Date();
    const upcoming: Reservation[] = [];
    const past: Reservation[] = [];
    
    // Enrich reservations with place data
    const enrichedReservations = data.map(reservation => {
      const place = allPlaces.find(p => p.id === reservation.place_id);
      return {
        ...reservation,
        place
      } as Reservation;
    });
    
    // Split into upcoming and past
    enrichedReservations.forEach(reservation => {
      const reservationDate = new Date(reservation.reservation_date);
      
      if (isPast(reservationDate) || reservation.status === 'cancelled' || reservation.status === 'completed') {
        past.push(reservation);
      } else {
        upcoming.push(reservation);
      }
    });
    
    setReservations(enrichedReservations);
    setUpcomingBookings(upcoming);
    setPastBookings(past.sort((a, b) => 
      new Date(b.reservation_date).getTime() - new Date(a.reservation_date).getTime()
    ));
  };
  
  const processTickets = (data: any[]) => {
    if (!data) return;
    
    const enrichedTickets = data.map(ticket => {
      const place = allPlaces.find(p => p.id === ticket.place_id);
      return {
        ...ticket,
        place
      } as TicketType;
    });
    
    setTickets(enrichedTickets);
  };
  
  const handleBookingAction = (action: string, booking: Reservation) => {
    if (action === 'reschedule') {
      toast({
        title: "Reschedule Reservation",
        description: "This feature will be implemented soon"
      });
    } else if (action === 'cancel') {
      cancelReservation(booking.id);
    }
  };
  
  const cancelReservation = async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId);
        
      if (error) throw error;
      
      toast({
        title: "Reservation Cancelled",
        description: "Your reservation has been cancelled successfully"
      });
      
      fetchReservationsAndTickets();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast({
        title: "Error cancelling reservation",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateReservation = (place: Place | null = null) => {
    if (place) {
      setSelectedPlace(place);
    }
    setShowReservationModal(true);
  };
  
  const handleReservationCreated = () => {
    fetchReservationsAndTickets();
    setShowReservationModal(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEE, MMM d');
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const ReservationCard = ({ booking }: { booking: Reservation }) => {
    const navigate = useNavigate();
    
    const goToPlaceDetails = () => {
      navigate(`/place/${booking.place_id}`);
    };
    
    return (
      <div className="border rounded-lg overflow-hidden mb-4 bg-white">
        <div className="flex">
          <div className="w-1/3 h-28">
            <img 
              src={booking.place?.imageUrl || 'https://via.placeholder.com/150?text=Place'} 
              alt={booking.place?.name || 'Place'} 
              className="w-full h-full object-cover"
              onClick={goToPlaceDetails}
            />
          </div>
          <div className="w-2/3 p-3">
            <h3 className="font-medium truncate" onClick={goToPlaceDetails}>
              {booking.place?.name || 'Unknown Place'}
            </h3>
            
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formatDate(booking.reservation_date)}</span>
              <span className="mx-1">•</span>
              <Clock className="w-3 h-3 mr-1" />
              <span>{formatTime(booking.reservation_date)}</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <User className="w-3 h-3 mr-1" />
              <span>{booking.party_size} {booking.party_size === 1 ? 'person' : 'people'}</span>
            </div>
            
            <div className="flex mt-2 justify-between items-center">
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              
              {booking.status === 'confirmed' && (
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleBookingAction('reschedule', booking)}>
                    Reschedule
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleBookingAction('cancel', booking)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TicketCard = ({ ticket }: { ticket: TicketType }) => {
    return (
      <div className="border rounded-lg overflow-hidden mb-4 bg-white">
        <div className="flex">
          <div className="w-1/3 h-28">
            <img 
              src={ticket.place?.imageUrl || 'https://via.placeholder.com/150?text=Event'} 
              alt={ticket.place?.name || 'Event'} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-2/3 p-3">
            <div className="flex items-center">
              <h3 className="font-medium truncate">
                {ticket.place?.name || 'Unknown Event'}
              </h3>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                ticket.ticket_type === 'vip' 
                  ? 'bg-purple-100 text-purple-800' 
                  : ticket.ticket_type === 'early_bird'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {ticket.ticket_type.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formatDate(ticket.event_date)}</span>
              <span className="mx-1">•</span>
              <Clock className="w-3 h-3 mr-1" />
              <span>{formatTime(ticket.event_date)}</span>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-medium">${ticket.price.toFixed(2)}</span>
              
              <span className={`text-xs px-2 py-1 rounded-full ${
                ticket.status === 'valid' 
                  ? 'bg-green-100 text-green-800'
                  : ticket.status === 'used'
                  ? 'bg-blue-100 text-blue-800'
                  : ticket.status === 'expired'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </span>
            </div>
            
            {ticket.status === 'valid' && (
              <div className="mt-2 flex">
                <Button variant="outline" size="sm" className="w-full">
                  <Ticket className="w-3 h-3 mr-2" />
                  View Ticket
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${isMobile ? 'pt-4' : 'pt-[62px]'} pb-20 px-4`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Bookings</h1>
        
        <Button onClick={() => handleCreateReservation()} size="sm" className="rounded-full">
          <Plus className="w-4 h-4 mr-1" /> New Reservation
        </Button>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as TabValue)}
      >
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="reservations">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="tickets">
            <Ticket className="w-3 h-3 mr-1" />
            Tickets
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="reservations">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading reservations...</p>
            </div>
          ) : reservations.length > 0 ? (
            reservations.map(booking => (
              <ReservationCard
                key={booking.id}
                booking={booking}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 font-medium">No reservations found</h3>
              <p className="text-sm text-muted-foreground">When you make reservations, they'll appear here</p>
              <Button
                onClick={() => handleCreateReservation()}
                variant="outline"
                className="mt-4 rounded-full"
              >
                Make a Reservation
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading upcoming reservations...</p>
            </div>
          ) : upcomingBookings.length > 0 ? (
            upcomingBookings.map(booking => (
              <ReservationCard
                key={booking.id}
                booking={booking}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 font-medium">No upcoming reservations</h3>
              <p className="text-sm text-muted-foreground">When you make reservations, they'll appear here</p>
              <Button
                onClick={() => handleCreateReservation()}
                variant="outline"
                className="mt-4 rounded-full"
              >
                Make a Reservation
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading past reservations...</p>
            </div>
          ) : pastBookings.length > 0 ? (
            pastBookings.map(booking => (
              <ReservationCard
                key={booking.id}
                booking={booking}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 font-medium">No past reservations</h3>
              <p className="text-sm text-muted-foreground">Your booking history will appear here</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="tickets">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading tickets...</p>
            </div>
          ) : tickets.length > 0 ? (
            tickets.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 font-medium">No tickets found</h3>
              <p className="text-sm text-muted-foreground">When you purchase tickets, they'll appear here</p>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="mt-4 rounded-full"
              >
                Explore Events
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {showReservationModal && (
        <ReservationModal
          place={selectedPlace}
          isOpen={showReservationModal}
          onClose={() => setShowReservationModal(false)}
          onReservationCreated={handleReservationCreated}
        />
      )}
    </div>
  );
};

export default Bookings;
