
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuthContext";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { UserProfile } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const { isSupported: notificationsSupported } = useNotifications();
  const { data: places } = usePlaces();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setUserProfile({
            ...data,
            stats: {
              bookings_count: data.bookings_count || 0,
              saved_count: data.saved_count || 0,
              free_reservations: data.free_reservations || 0,
              loyalty_points: data.loyalty_points || 0,
            }
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, navigate, toast]);

  const handleProfileUpdate = async (updatedProfile: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', user.id);

      if (error) throw error;

      setUserProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    }
  };

  if (loading) {
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
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
                  bookingsCount={userProfile.stats?.bookings_count || 0}
                  savedCount={userProfile.stats?.saved_count || 0}
                  freeReservations={userProfile.stats?.free_reservations || 0}
                  loyaltyPoints={userProfile.stats?.loyalty_points || 0}
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
              user={userProfile} 
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
