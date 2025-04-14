
import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from "@/components/ui/card";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileStats from "@/components/ProfileStats";
import ProfileOverview from "@/components/ProfileOverview";
import { UserProfile, Place } from "@/types";
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [pastBookings, setPastBookings] = useState<Place[]>([]);
  const { permissionStatus, requestPermission } = useNotifications();

  useEffect(() => {
    // Simulate API call to fetch user profile
    const fetchProfile = async () => {
      // This would be an API call in a real app
      setTimeout(() => {
        setUser({
          id: "user-123",
          full_name: "Alex Johnson",
          username: "alexj",
          avatar_url: "https://i.pravatar.cc/150?img=32",
          email: "alex@example.com",
          bookings_count: 12,
          saved_count: 8,
          free_reservations: 1,
          loyalty_points: 350
        });

        // Sample favorites
        setFavorites([
          {
            id: "place-1",
            name: "Skyline Restaurant",
            imageUrl: "https://i.pravatar.cc/300?img=5",
            address: "123 Main St, City",
            category: "restaurant",
            rating: 4.8,
            reviewCount: 120,
            location: {
              lat: 37.7749,
              lng: -122.4194
            }
          },
          {
            id: "place-2",
            name: "Grand Hotel",
            imageUrl: "https://i.pravatar.cc/300?img=6",
            address: "456 Park Ave, City",
            category: "hotel",
            rating: 4.6,
            reviewCount: 86,
            location: {
              lat: 37.7851,
              lng: -122.4094
            }
          }
        ]);

        // Sample past bookings
        setPastBookings([
          {
            id: "place-3",
            name: "City Tours",
            imageUrl: "https://i.pravatar.cc/300?img=7",
            address: "789 Tour St, City",
            category: "activity",
            rating: 4.5,
            reviewCount: 32,
            location: {
              lat: 37.7651,
              lng: -122.4194
            }
          }
        ]);

        setIsLoading(false);
      }, 1000);
    };

    fetchProfile();
  }, []);

  const handleEnableNotifications = async () => {
    await requestPermission();
  };

  return (
    <div className="p-4 pb-16">
      <Card className="mb-4">
        <CardHeader>
          {user && <ProfileHeader user={user} isLoading={isLoading} />}
        </CardHeader>
        
        {!isLoading && user && (
          <>
            <ProfileStats 
              bookingsCount={user.bookings_count || 0} 
              savedCount={user.saved_count || 0}
              freeReservations={user.free_reservations || 0}
              loyaltyPoints={user.loyalty_points || 0}
            />
            
            {permissionStatus !== 'granted' && (
              <div className="px-4 pb-4">
                <Button 
                  onClick={handleEnableNotifications}
                  className="w-full flex items-center justify-center"
                  variant="outline"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Enable Notifications
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
      
      {!isLoading && (
        <ProfileOverview
          favorites={favorites}
          pastBookings={pastBookings}
        />
      )}
    </div>
  );
};

export default Profile;
