
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileOverview from "@/components/ProfileOverview";
import ProfileStats from "@/components/ProfileStats";
import NotificationPreferences from "@/components/NotificationPreferences";
import SettingsTab from "@/components/SettingsTab";
import HelpTab from "@/components/HelpTab";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Place } from '@/types';
import { usePlaces } from '@/hooks/usePlaces';

const Profile = () => {
  const { user, loading: authLoading } = useAuthContext();
  const [activeTab, setActiveTab] = useState("overview");
  const { isSupported: notificationsSupported } = useNotifications();
  const { data: places } = usePlaces();

  // Mock data for demonstration - in a real app, these would come from the backend
  const mockFavorites = places?.slice(0, 3) || [];
  const mockPastBookings = places?.slice(0, 2).map(place => ({
    ...place,
    booking_date: new Date().toISOString(),
    status: 'completed'
  })) || [];

  const mockUserProfile = {
    id: user?.id || "123",
    full_name: user?.user_metadata?.full_name || "Sarah Johnson",
    username: user?.user_metadata?.username || "sarahjohnson",
    avatar_url: user?.user_metadata?.avatar_url || "https://i.pravatar.cc/150?img=23",
    email: user?.email || "sarah@example.com",
    phone: "+1 555-123-4567",
    website: "www.sarahjohnson.com",
    bookings_count: mockPastBookings.length,
    saved_count: mockFavorites.length,
    free_reservations: 2,
    loyalty_points: 450
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 pt-16 md:pt-6 pb-20 md:pb-6 max-w-4xl mx-auto">
      <ProfileHeader
        user={mockUserProfile}
        isLoading={false}
      />
      
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-6"
      >
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2">
              <ProfileOverview 
                favorites={mockFavorites}
                pastBookings={mockPastBookings}
              />
            </div>
            
            <div className="col-span-1">
              <ProfileStats 
                bookingsCount={mockUserProfile.bookings_count}
                savedCount={mockUserProfile.saved_count}
                freeReservations={mockUserProfile.free_reservations}
                loyaltyPoints={mockUserProfile.loyalty_points}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          {notificationsSupported ? (
            <NotificationPreferences />
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <h3 className="text-lg font-medium">Notifications Not Supported</h3>
              <p className="text-muted-foreground mt-2">
                Push notifications are not supported in your browser. Try using our mobile app for a better experience.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <SettingsTab user={mockUserProfile} />
        </TabsContent>
        
        <TabsContent value="help" className="mt-6">
          <HelpTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
