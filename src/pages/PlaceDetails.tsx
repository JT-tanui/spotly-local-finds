
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Phone, Globe, Clock, 
  Calendar, Heart, CalendarDays, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Place } from '@/types';
import { usePlaces } from '@/hooks/usePlaces';
import { useLocation } from '@/hooks/useLocation';
import { Skeleton } from '@/components/ui/skeleton';
import ReservationModal from '@/components/ReservationModal';

const PlaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showReservation, setShowReservation] = useState(false);
  const { location } = useLocation();
  const { allPlaces, loading } = usePlaces(location);
  const [isSaved, setIsSaved] = useState(false);

  // Find the place based on the id
  const place = allPlaces.find(p => p.id === id);

  const toggleSave = () => {
    setIsSaved(!isSaved);
    // In a real app, this would save to a database
  };

  const handleReservation = () => {
    setShowReservation(true);
  };

  const closeReservation = () => {
    setShowReservation(false);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="pt-[62px] p-4">
        <Skeleton className="w-full h-64" />
        <div className="mt-4">
          <Skeleton className="w-3/4 h-8" />
          <Skeleton className="w-1/2 h-6 mt-2" />
          <Skeleton className="w-full h-40 mt-4" />
          <Skeleton className="w-full h-24 mt-4" />
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="pt-[62px] p-4 text-center">
        <p>Place not found</p>
        <Button onClick={handleGoBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="pt-[62px] pb-20">
      {/* Large Image */}
      <div className="relative h-64 w-full overflow-hidden">
        <img 
          src={place.imageUrl} 
          alt={place.name} 
          className="w-full h-full object-cover"
        />
        <Button 
          variant="outline" 
          size="icon"
          className="absolute top-4 left-4 bg-white rounded-full"
          onClick={handleGoBack}
        >
          <span className="sr-only">Go back</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          className={`absolute top-4 right-4 bg-white rounded-full ${isSaved ? 'text-red-500' : 'text-gray-500'}`}
          onClick={toggleSave}
        >
          <Heart className={isSaved ? 'fill-current' : ''} />
          <span className="sr-only">{isSaved ? 'Unsave' : 'Save'}</span>
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h1 className="text-2xl font-bold">{place.name}</h1>
        
        <div className="flex items-center mt-2 text-sm">
          <div className="flex items-center mr-3">
            <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
            <span>{place.rating}</span>
            <span className="text-xs text-muted-foreground ml-1">({place.reviewCount})</span>
          </div>
          <div className="mr-3">{place.category}</div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="w-3 h-3 mr-1" />
            <span>{place.distance} km away</span>
          </div>
        </div>

        {/* Map */}
        <div className="mt-4 rounded-lg overflow-hidden border h-40">
          <div className="h-full w-full bg-blue-50 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Map would display here</p>
          </div>
        </div>

        {/* Contact and Hours */}
        <div className="mt-4 space-y-3">
          {place.phone && (
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              <a href={`tel:${place.phone}`} className="text-blue-600">{place.phone}</a>
            </div>
          )}
          
          {place.website && (
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 truncate">{place.website}</a>
            </div>
          )}
          
          {place.openHours && (
            <div className="flex items-start">
              <Clock className="w-4 h-4 mr-2 mt-0.5" />
              <div>
                <div className={`font-medium ${place.openHours.open ? 'text-green-600' : 'text-red-600'}`}>
                  {place.openHours.open ? 'Open Now' : 'Closed'}
                </div>
                {place.openHours.hours && <div className="text-sm text-muted-foreground">{place.openHours.hours}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-muted-foreground">{place.description || "No description available."}</p>
        </div>

        {/* Popular Times */}
        {place.popularTimes && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Popular Times</h2>
            <div className="text-sm text-muted-foreground">
              Typically busy in the evenings and weekends.
            </div>
          </div>
        )}

        {/* Reservation Button */}
        <div className="mt-6">
          <Button 
            onClick={handleReservation} 
            className="w-full"
            size="lg"
          >
            <Calendar className="mr-2 h-4 w-4" /> Make Reservation
          </Button>
        </div>
      </div>

      {/* Reservation Modal */}
      {showReservation && place && (
        <ReservationModal 
          place={place} 
          isOpen={showReservation} 
          onClose={closeReservation}
        />
      )}
    </div>
  );
};

export default PlaceDetails;
