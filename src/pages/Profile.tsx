
import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsDesktop, useIsTablet } from '@/hooks/useMediaQuery';
import { usePlaces } from '@/hooks/usePlaces';
import { useLocation } from '@/hooks/useLocation';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types';

// Import refactored components
import ProfileHeader from '@/components/ProfileHeader';
import ProfileStats from '@/components/ProfileStats';
import QuickActions from '@/components/QuickActions';
import ReferralCard from '@/components/ReferralCard';
import ProfileOverview from '@/components/ProfileOverview';
import SettingsTab from '@/components/SettingsTab';
import HelpTab from '@/components/HelpTab';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const isDesktop = useIsDesktop();
  const isTablet = useIsTablet();
  const { location } = useLocation();
  const { featuredPlaces, allPlaces } = usePlaces(location);
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Mock stats data - in a real app, this would come from the backend
  const profileStats = {
    bookingsCount: 12,
    savedCount: 8,
    freeReservations: 1,
    loyaltyPoints: 350,
    referralCode: "SARAH-2025"
  };
  
  // Use first 3 places as mock favorites
  const [favorites] = useState(featuredPlaces.slice(0, 3));
  const [pastBookings] = useState(allPlaces.slice(0, 2));

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      
      if (authData.user) {
        // Try to fetch user profile from database
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        if (profileData) {
          setUserProfile(profileData);
        } else {
          // If no profile exists, use auth data to create a mock profile
          setUserProfile({
            id: authData.user.id,
            email: authData.user.email,
            full_name: authData.user.user_metadata?.full_name || "User",
            avatar_url: authData.user.user_metadata?.avatar_url,
            created_at: authData.user.created_at,
          });
        }
      } else {
        // Mock user for demo
        setUserProfile({
          id: "mock-user",
          full_name: "Sarah Johnson",
          email: "sarah@example.com",
          phone: "+1 (555) 123-4567",
          avatar_url: "https://i.pravatar.cc/150?img=23",
          created_at: new Date("2023-11-01").toISOString(),
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error loading profile",
        description: "Failed to load your profile information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`pt-[62px] pb-20 ${isDesktop ? 'px-8' : 'px-4'}`}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Button variant="ghost" size="sm" onClick={() => setActiveTab("settings")}>
          <Settings className="h-4 w-4 mr-1" />
          Settings
        </Button>
      </div>
      
      {/* Main Content - Responsive Layout */}
      <div className={`${isDesktop ? 'grid grid-cols-3 gap-6' : 'flex flex-col gap-4'}`}>
        {/* Left Column (Profile Card, Stats) */}
        <div className={`${isDesktop ? 'col-span-1' : ''}`}>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-40 bg-slate-200 rounded-lg"></div>
              <div className="h-20 bg-slate-200 rounded-lg"></div>
              <div className="h-20 bg-slate-200 rounded-lg"></div>
            </div>
          ) : (
            <>
              {userProfile && (
                <ProfileHeader 
                  user={userProfile} 
                  onEditProfile={() => setActiveTab("settings")} 
                />
              )}
              
              <ProfileStats
                bookingsCount={profileStats.bookingsCount}
                savedCount={profileStats.savedCount}
                freeReservations={profileStats.freeReservations}
                loyaltyPoints={profileStats.loyaltyPoints}
              />
              
              <QuickActions />
              
              {/* Referral Card - Desktop and Tablet Only */}
              {(isDesktop || isTablet) && (
                <ReferralCard referralCode={profileStats.referralCode} />
              )}
            </>
          )}
        </div>
        
        {/* Right/Main Column (Content) */}
        <div className={`${isDesktop ? 'col-span-2' : ''}`}>
          {/* Tabs for profile content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="animate-fade-in">
              <ProfileOverview favorites={favorites} pastBookings={pastBookings} />
            </TabsContent>
            
            <TabsContent value="settings" className="animate-fade-in">
              <SettingsTab />
            </TabsContent>
            
            <TabsContent value="help" className="animate-fade-in">
              <HelpTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
