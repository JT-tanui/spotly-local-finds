
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, CalendarDays, Star } from 'lucide-react';
import { Place } from '@/types';

interface ProfileOverviewProps {
  favorites: Place[];
  pastBookings: Place[];
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ favorites, pastBookings }) => {
  const navigate = useNavigate();
  
  const handlePlaceClick = (place: Place) => {
    navigate(`/place/${place.id}`);
  };
  
  return (
    <>
      {/* Saved Places */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Saved Places</h2>
          {favorites.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/saved')}>
              View All
            </Button>
          )}
        </div>
        
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favorites.map((place) => (
              <div 
                key={place.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow animate-fade-in cursor-pointer"
                onClick={() => handlePlaceClick(place)}
              >
                <div className="relative h-32">
                  <img 
                    src={place.imageUrl} 
                    alt={place.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 right-0 bg-black/60 text-white text-xs px-2 py-1 rounded-bl-lg">
                    {place.distance} km
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold truncate">{place.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{place.category}</span>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="text-xs">{place.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg py-8 text-center">
            <Heart className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No saved places yet</p>
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="mt-1"
            >
              Explore places
            </Button>
          </div>
        )}
      </div>
      
      {/* Recent Bookings */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Bookings</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/bookings')}>
            View All
          </Button>
        </div>
        
        {pastBookings.length > 0 ? (
          <div className="space-y-3">
            {pastBookings.map((booking, index) => (
              <div key={`booking-${index}`} className="overflow-hidden border rounded-lg shadow-sm">
                <div className="flex">
                  <div className="w-24 h-24">
                    <img 
                      src={booking.imageUrl} 
                      alt={booking.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{booking.name}</h3>
                      <div className="bg-green-100 text-green-800 px-2 py-0.5 text-xs rounded-full">
                        Completed
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      April {10 - index}, 2025 • 7:30 PM
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-muted-foreground">
                        {booking.category}
                      </span>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 text-spotly-red"
                        onClick={() => handlePlaceClick(booking)}
                      >
                        Book Again
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg py-8 text-center">
            <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No bookings yet</p>
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="mt-1"
            >
              Explore places
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileOverview;
