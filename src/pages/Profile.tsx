
import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsDesktop, useIsTablet, useIsMobile } from '@/hooks/useMediaQuery';
import { usePlaces } from '@/hooks/usePlaces';
import { useLocation } from '@/hooks/useLocation';
import { UserProfile } from '@/types';
import ProfileHeader from '@/components/ProfileHeader';
import ProfileStats from '@/components/ProfileStats';
import QuickActions from '@/components/QuickActions';
import ReferralCard from '@/components/ReferralCard';
import ProfileOverview from '@/components/ProfileOverview';
import SettingsTab from '@/components/SettingsTab';
import HelpTab from '@/components/HelpTab';
import SocialConnections from '@/components/SocialConnections';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import RecommendationEngine from '@/components/RecommendationEngine';

const Profile = () => {
  const isDesktop = useIsDesktop();
  const isTablet = useIsTablet();
  const isMobile = useIsMobile();
  const { location } = useLocation();
  const { featuredPlaces, allPlaces } = usePlaces(location);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  // Mock stats data - in a real app, this would come from the backend
  const profileStats = {
    bookingsCount: 12,
    savedCount: 8,
    freeReservations: 1,
    loyaltyPoints: 350,
    referralCode: "SARAH-2025"
  };
  
  // Use first 3 places as mock favorites
  const [favorites] = useState(featuredPlaces?.slice(0, 3) || []);
  const [pastBookings] = useState(allPlaces?.slice(0, 2) || []);

  useEffect(() => {
    if (profile) {
      setLoading(false);
    }
  }, [profile]);

  return (
    <div className={`${isMobile ? 'pt-[10px]' : 'pt-[62px]'} pb-20 ${isDesktop ? 'px-8' : 'px-4'}`}>
      {/* Page Header - Desktop Only */}
      {!isMobile && (
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Button variant="ghost" size="sm" onClick={() => setActiveTab("settings")}>
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      )}
      
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">My Profile</h1>
          <Button variant="ghost" size="icon" onClick={() => setActiveTab("settings")}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      )}
      
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
              {profile && (
                <ProfileHeader 
                  user={profile} 
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

              {/* Recommendations - Mobile Only */}
              {isMobile && profile && (
                <RecommendationEngine 
                  userId={profile.id}
                  location={location}
                  maxItems={2}
                  className="mb-6"
                />
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
              <div className="space-y-6">
                {/* Social Connections Component */}
                <SocialConnections />
                
                {/* Other Overview Components */}
                <ProfileOverview favorites={favorites} pastBookings={pastBookings} />

                {/* Referral Card - Mobile Only */}
                {isMobile && (
                  <ReferralCard referralCode={profileStats.referralCode} />
                )}
              </div>
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
