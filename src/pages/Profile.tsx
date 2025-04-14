
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from "@/hooks/useAuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { usePlaces } from '@/hooks/usePlaces';
import ProfileHeader from "@/components/ProfileHeader";
import ProfileOverview from "@/components/ProfileOverview";
import ProfileStats from "@/components/ProfileStats";
import ProfileEditForm from "@/components/ProfileEditForm";
import NotificationPreferences from "@/components/NotificationPreferences";
import SettingsTab from "@/components/SettingsTab";
import HelpTab from "@/components/HelpTab";
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from "@/components/ui/skeleton";
import { UserProfile } from '@/types';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuthContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const { isSupported: notificationsSupported } = useNotifications();
  const { data: places, isLoading: placesLoading } = usePlaces();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // In a real app, fetch user profile from API
    const mockProfile: UserProfile = {
      id: user.id,
      full_name: user.user_metadata?.full_name || "Sarah Johnson",
      username: user.user_metadata?.username || "sarahjohnson",
      avatar_url: user.user_metadata?.avatar_url || "https://i.pravatar.cc/150?img=23",
      email: user.email || "sarah@example.com",
      phone: "+1 555-123-4567",
      website: "www.sarahjohnson.com",
      bio: "Food enthusiast and adventure seeker",
      location: "San Francisco, CA",
      bookings_count: 5,
      saved_count: 12,
      free_reservations: 2,
      loyalty_points: 450,
    };

    setUserProfile(mockProfile);
    setLoading(false);
  }, [user, navigate]);

  const handleProfileUpdate = async (updatedProfile: Partial<UserProfile>) => {
    try {
      // In a real app, send to API
      setUserProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading || authLoading) {
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

  if (!userProfile) {
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
        user={userProfile}
        isEditing={isEditing}
        onEditClick={() => setIsEditing(true)}
        isLoading={false}
      />
      
      {isEditing ? (
        <div className="mt-6">
          <ProfileEditForm
            profile={userProfile}
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
                  bookingsCount={userProfile.bookings_count || 0}
                  savedCount={userProfile.saved_count || 0}
                  freeReservations={userProfile.free_reservations || 0}
                  loyaltyPoints={userProfile.loyalty_points || 0}
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
            <SettingsTab user={userProfile} onUpdateProfile={handleProfileUpdate} />
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
