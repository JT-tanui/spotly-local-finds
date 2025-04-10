
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, AlertTriangle } from 'lucide-react';

// Mocked bookings data
const mockUpcomingBookings = [
  {
    id: '1',
    placeId: '1',
    placeName: 'Central Park Café',
    placeImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
    date: new Date('2025-04-15'),
    time: '1:00 PM',
    partySize: 2,
    status: 'confirmed'
  },
  {
    id: '2',
    placeId: '3',
    placeName: 'Skyline Bar',
    placeImage: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
    date: new Date('2025-04-20'),
    time: '8:30 PM',
    partySize: 4,
    status: 'confirmed'
  }
];

const mockPastBookings = [
  {
    id: '3',
    placeId: '5',
    placeName: 'Museum of Modern Art',
    placeImage: 'https://images.unsplash.com/photo-1562204440-239b3efc7591?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
    date: new Date('2025-03-10'),
    time: '11:00 AM',
    partySize: 2,
    status: 'completed'
  },
  {
    id: '4',
    placeId: '2',
    placeName: 'City Park',
    placeImage: 'https://images.unsplash.com/photo-1504714146340-959ca07e1f38?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
    date: new Date('2025-03-01'),
    time: '3:00 PM',
    partySize: 3,
    status: 'cancelled'
  }
];

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const BookingCard = ({ booking, onAction }: any) => {
  const navigate = useNavigate();
  
  const goToPlaceDetails = () => {
    navigate(`/place/${booking.placeId}`);
  };
  
  return (
    <div className="border rounded-lg overflow-hidden mb-4 bg-white">
      <div className="flex">
        <div className="w-1/3 h-28">
          <img 
            src={booking.placeImage} 
            alt={booking.placeName} 
            className="w-full h-full object-cover"
            onClick={goToPlaceDetails}
          />
        </div>
        <div className="w-2/3 p-3">
          <h3 className="font-medium truncate" onClick={goToPlaceDetails}>{booking.placeName}</h3>
          
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{formatDate(booking.date)}</span>
            <span className="mx-1">•</span>
            <Clock className="w-3 h-3 mr-1" />
            <span>{booking.time}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <User className="w-3 h-3 mr-1" />
            <span>{booking.partySize} {booking.partySize === 1 ? 'person' : 'people'}</span>
          </div>
          
          <div className="flex mt-2 justify-between items-center">
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            
            {booking.status === 'confirmed' && (
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => onAction('reschedule', booking)}>
                  Reschedule
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAction('cancel', booking)}>
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

const Bookings = () => {
  const [upcomingBookings] = useState(mockUpcomingBookings);
  const [pastBookings] = useState(mockPastBookings);
  
  const handleBookingAction = (action: string, booking: any) => {
    console.log(`${action} booking:`, booking);
    // In a real app, this would open a modal or navigate to another page
  };
  
  return (
    <div className="pt-[62px] pb-20 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Bookings</h1>
      
      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onAction={handleBookingAction}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 font-medium">No upcoming bookings</h3>
              <p className="text-sm text-muted-foreground">When you make reservations, they'll appear here</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {pastBookings.length > 0 ? (
            pastBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onAction={handleBookingAction}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 font-medium">No past bookings</h3>
              <p className="text-sm text-muted-foreground">Your booking history will appear here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Bookings;
