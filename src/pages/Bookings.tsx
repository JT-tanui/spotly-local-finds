
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, AlertTriangle, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Reservation, Place } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format, isPast } from 'date-fns';
import { usePlaces } from '@/hooks/usePlaces';
import { useLocation } from '@/hooks/useLocation';
import ReservationModal from '@/components/ReservationModal';

// Type for tab values
type TabValue = 'reservations' | 'upcoming' | 'past';

const Bookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { location } = useLocation();
  const { allPlaces } = usePlaces(location);
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Reservation[]>([]);
  const [pastBookings, setPastBookings] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('reservations');
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
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
        
        processReservations(mockReservations);
        return;
      }
      
      const { data: reservationsData, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('reservation_date', { ascending: true });
        
      if (error) throw error;
      
      processReservations(reservationsData);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: "Error fetching reservations",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
      };
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
  
  const handleBookingAction = (action: string, booking: Reservation) => {
    if (action === 'reschedule') {
      // For demo purposes, just show a toast
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
      
      fetchReservations();
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
    fetchReservations();
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

  return (
    <div className="pt-[62px] pb-20 px-4">
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
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="reservations">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
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
