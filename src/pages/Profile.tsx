
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileOverview from "@/components/ProfileOverview";
import ProfileStats from "@/components/ProfileStats";
import QuickActions from "@/components/QuickActions";
import SocialConnections from "@/components/SocialConnections";
import SettingsTab from "@/components/SettingsTab";
import HelpTab from "@/components/HelpTab";
import NotificationPreferences from "@/components/NotificationPreferences";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuthContext";
import { useIsMobile, useIsTablet } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from '@/hooks/useNotifications';

const Profile = () => {
  const { user, profile, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { toast } = useToast();
  const { sendMessageNotification, sendEventReminderNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState("overview");
  
  // For testing notifications
  const testMessageNotification = () => {
    sendMessageNotification(
      "Test User",
      "This is a test message notification. It demonstrates how push notifications work.",
      "https://i.pravatar.cc/150?img=3"
    );
    
    toast({
      title: "Test Notification Sent",
      description: "Check your device notifications"
    });
  };
  
  const testEventNotification = () => {
    sendEventReminderNotification(
      "Weekend Hiking Trip",
      "Tomorrow at 9:00 AM",
      "event-123"
    );
    
    toast({
      title: "Test Event Reminder Sent",
      description: "Check your device notifications"
    });
  };
  
  if (!user) {
    return (
      <div className="p-4 min-h-[80vh] flex flex-col justify-center items-center text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
        <p className="text-muted-foreground mb-4">
          You need to be signed in to view your profile.
        </p>
        <Button asChild>
          <a href="/auth">Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className={`pt-4 px-4 pb-20 ${isMobile ? '' : 'pt-[60px]'}`}>
      <ProfileHeader user={profile} isLoading={isLoading} />
      
      <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="col-span-1 lg:col-span-2">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className={`${isMobile ? 'grid grid-cols-3' : isTablet ? 'grid grid-cols-4' : ''}`}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <ProfileOverview />
              <ProfileStats />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Test Notifications</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={testMessageNotification}>
                    Test Message Notification
                  </Button>
                  <Button variant="outline" onClick={testEventNotification}>
                    Test Event Reminder
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="connections">
              <SocialConnections />
            </TabsContent>
            
            <TabsContent value="notifications">
              <NotificationPreferences />
            </TabsContent>
            
            <TabsContent value="settings">
              <SettingsTab />
              <div className="mt-6">
                <HelpTab />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Profile;
