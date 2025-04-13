
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Phone, Globe, Clock, 
  Calendar, Heart, CalendarDays, Users, 
  Info, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Place } from '@/types';
import { usePlaces } from '@/hooks/usePlaces';
import { useLocation } from '@/hooks/useLocation';
import { Skeleton } from '@/components/ui/skeleton';
import ReservationModal from '@/components/ReservationModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const PlaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showReservation, setShowReservation] = useState(false);
  const { location } = useLocation();
  const { allPlaces, loading } = usePlaces(location);
  const [isSaved, setIsSaved] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState<any>(null);
  const [isLoadingAdditionalInfo, setIsLoadingAdditionalInfo] = useState(false);
  const { toast } = useToast();

  // Find the place based on the id
  const place = allPlaces.find(p => p.id === id);

  // Fetch additional info when place is loaded
  useEffect(() => {
    if (place && !additionalInfo) {
      fetchAdditionalInfo(place);
    }
  }, [place]);

  // Function to fetch additional information about the place
  const fetchAdditionalInfo = async (placeData: Place) => {
    try {
      setIsLoadingAdditionalInfo(true);
      
      // In a real app, we would call an API that searches for more information
      // For demo purposes, we'll create simulated place data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const simulatedInfo = {
        reviews: [
          { 
            id: '1', 
            author: 'Alex Johnson', 
            rating: 4.5, 
            text: 'Great atmosphere and excellent service. The staff was very friendly and accommodating.',
            date: '2025-03-15'
          },
          { 
            id: '2', 
            author: 'Jamie Smith', 
            rating: 5.0, 
            text: 'Amazing experience! The food was delicious and the ambiance was perfect for our anniversary celebration.',
            date: '2025-03-10'
          },
          { 
            id: '3', 
            author: 'Taylor Brown', 
            rating: 4.0, 
            text: 'Very good overall. It was a bit crowded when we went, but the quality made up for it.',
            date: '2025-03-05'
          }
        ],
        details: {
          founded: `${2010 + Math.floor(Math.random() * 10)}`,
          owner: ['John Smith', 'Maria Garcia', 'David Chen'][Math.floor(Math.random() * 3)],
          specialFeatures: [
            'Outdoor seating', 
            'Pet friendly', 
            'Wheelchair accessible', 
            'Free WiFi'
          ].slice(0, 2 + Math.floor(Math.random() * 3)),
          popularDishes: placeData.category === 'restaurant' || placeData.category === 'cafe' ? 
            ['Signature pasta', 'Chocolate dessert', 'House special salad'] : null,
          sustainabilityEfforts: Math.random() > 0.5 ? ['Eco-friendly packaging', 'Local sourcing', 'Energy efficient'] : null
        },
        nearbyAttractions: [
          {
            name: `${['Central', 'Memorial', 'Riverside', 'City'][Math.floor(Math.random() * 4)]} Park`,
            distance: (Math.random() * 0.8 + 0.2).toFixed(1),
            type: 'park'
          },
          {
            name: `${['Grand', 'Royal', 'Urban', 'Metro'][Math.floor(Math.random() * 4)]} Mall`,
            distance: (Math.random() * 0.9 + 0.3).toFixed(1),
            type: 'shopping'
          },
          {
            name: `${['Art', 'History', 'Science', 'Modern'][Math.floor(Math.random() * 4)]} Museum`,
            distance: (Math.random() * 1.2 + 0.5).toFixed(1),
            type: 'museum'
          }
        ]
      };
      
      setAdditionalInfo(simulatedInfo);
    } catch (error) {
      console.error('Error fetching additional info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load additional information',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingAdditionalInfo(false);
    }
  };

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

        {/* Tabs for different views */}
        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="nearby">Nearby</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {/* Map */}
            <div className="rounded-lg overflow-hidden border h-40">
              <div className="h-full w-full bg-blue-50 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Map would display here</p>
              </div>
            </div>

            {/* Contact and Hours */}
            <div className="space-y-3">
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
            <div>
              <h2 className="text-lg font-semibold mb-2">About</h2>
              <p className="text-muted-foreground">{place.description || "No description available."}</p>
            </div>

            {/* Popular Times */}
            {place.popularTimes && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Popular Times</h2>
                <div className="text-sm text-muted-foreground">
                  Typically busy in the evenings and weekends.
                </div>
              </div>
            )}

            {/* Additional Details */}
            {!isLoadingAdditionalInfo && additionalInfo?.details && (
              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="details">
                  <AccordionTrigger className="text-lg font-semibold">
                    <div className="flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Additional Details
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      {additionalInfo.details.founded && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Founded</span>
                          <span>{additionalInfo.details.founded}</span>
                        </div>
                      )}
                      {additionalInfo.details.owner && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Owner</span>
                          <span>{additionalInfo.details.owner}</span>
                        </div>
                      )}
                      {additionalInfo.details.specialFeatures?.length > 0 && (
                        <div className="flex flex-col">
                          <span className="text-muted-foreground mb-1">Special Features</span>
                          <div className="flex flex-wrap gap-1">
                            {additionalInfo.details.specialFeatures.map((feature: string, idx: number) => (
                              <span key={idx} className="bg-slate-100 text-xs px-2 py-1 rounded-full">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {additionalInfo.details.popularDishes?.length > 0 && (
                        <div className="flex flex-col">
                          <span className="text-muted-foreground mb-1">Popular Items</span>
                          <ul className="list-disc pl-5">
                            {additionalInfo.details.popularDishes.map((dish: string, idx: number) => (
                              <li key={idx}>{dish}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Reviews</h2>
              
              {isLoadingAdditionalInfo ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full mt-3" />
                      <Skeleton className="h-4 w-3/4 mt-2" />
                    </div>
                  ))}
                </div>
              ) : additionalInfo?.reviews ? (
                <div className="space-y-4">
                  {additionalInfo.reviews.map((review: any) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <div className="font-medium">{review.author}</div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <span>{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm mt-2">{review.text}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border rounded-lg">
                  <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No reviews available yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="nearby">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Nearby Attractions</h2>
              
              {isLoadingAdditionalInfo ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between border-b pb-3">
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              ) : additionalInfo?.nearbyAttractions ? (
                <div className="space-y-3">
                  {additionalInfo.nearbyAttractions.map((attraction: any, index: number) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <div className="font-medium">{attraction.name}</div>
                        <div className="text-sm text-muted-foreground capitalize">{attraction.type}</div>
                      </div>
                      <div className="text-sm">
                        {attraction.distance} km
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border rounded-lg">
                  <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No nearby attractions found</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

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
