
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { usePlaces } from '@/hooks/usePlaces';
import { useUserProfile } from '@/hooks/useUserProfile';
import ProfileHeader from "@/components/ProfileHeader";
import ProfileOverview from "@/components/ProfileOverview";
import ProfileStats from "@/components/ProfileStats";
import ProfileEditForm from "@/components/ProfileEditForm";
import NotificationPreferences from "@/components/NotificationPreferences";
import SettingsTab from "@/components/SettingsTab";
import HelpTab from "@/components/HelpTab";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const { isSupported: notificationsSupported } = useNotifications();
  const { places } = usePlaces();
  const { profile, isLoading, error, updateProfile } = useUserProfile();

  // Redirect to auth page if not logged in
  React.useEffect(() => {
    if (!user && !isLoading) {
      navigate('/auth');
    }
  }, [user, navigate, isLoading]);

  const handleProfileUpdate = async (updatedProfile: Partial<typeof profile>) => {
    updateProfile(updatedProfile);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-6 max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load profile'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const favorites = places?.slice(0, 3) || [];
  const pastBookings = places?.slice(0, 2).map(place => ({
    ...place,
    booking_date: new Date().toISOString(),
    status: 'completed'
  })) || [];

  return (
    <div className="container px-4 py-6 pt-16 md:pt-6 pb-20 md:pb-6 max-w-4xl mx-auto">
      <ProfileHeader
        user={profile}
        isEditing={isEditing}
        onEditClick={() => setIsEditing(true)}
        isLoading={false}
      />
      
      {isEditing ? (
        <div className="mt-6">
          <ProfileEditForm
            profile={profile}
            onSubmit={handleProfileUpdate}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-6"
        >
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2">
                <ProfileOverview 
                  favorites={favorites}
                  pastBookings={pastBookings}
                />
              </div>
              
              <div className="col-span-1">
                <ProfileStats 
                  bookingsCount={profile.stats?.bookings_count || 0}
                  savedCount={profile.stats?.saved_count || 0}
                  freeReservations={profile.stats?.free_reservations || 0}
                  loyaltyPoints={profile.stats?.loyalty_points || 0}
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
            <SettingsTab 
              user={profile} 
              onUpdateProfile={handleProfileUpdate}
            />
          </TabsContent>
          
          <TabsContent value="help" className="mt-6">
            <HelpTab />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Profile;
