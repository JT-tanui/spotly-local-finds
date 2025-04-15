
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PlaceDetails from "./pages/PlaceDetails";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import GroupEvents from "./pages/GroupEvents";
import LocationPicker from "./pages/LocationPicker";
import Inbox from "./pages/Inbox";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import TopNav from "./components/TopNav";
import { useIsTablet, useIsDesktop } from "./hooks/useMediaQuery";
import AuthContextProvider from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import { notificationService } from "./services/notificationService";
import { PushNotificationHelper } from "./services/pushNotificationHelper";
import { CapacitorService } from "./services/capacitorService";

import "./index.css";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const isTabletOrDesktop = useIsTablet() || useIsDesktop();
  const isNative = CapacitorService.isNative();
  
  // Initialize app and notifications
  useEffect(() => {
    // Initialize notifications when the app starts
    const initApp = async () => {
      // Print platform information to help with debugging
      if (isNative) {
        const deviceInfo = await CapacitorService.getDeviceInfo();
        console.log('Running on:', deviceInfo.platform, deviceInfo.operatingSystem, deviceInfo.osVersion);
      }
      
      await notificationService.init();
      PushNotificationHelper.loadScheduledReminders();
    };
    
    initApp();
  }, [isNative]);
  
  // Handle visibility changes separately
  useEffect(() => {
    // Add visibility change listener to detect when app comes to foreground
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // App came to foreground, update scheduled reminders
        PushNotificationHelper.loadScheduledReminders();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return (
    <>
      {isTabletOrDesktop && <TopNav />}
      <div 
        className={`max-w-6xl mx-auto min-h-[100dvh] relative bg-background 
          ${isTabletOrDesktop ? 'pt-16' : isNative ? 'pt-0 pb-20' : 'pt-0 pb-20'}`}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/place/:id" element={<PlaceDetails />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/events" element={<GroupEvents />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/location" element={<LocationPicker />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </div>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthContextProvider>
        <TooltipProvider delayDuration={300}>
          <AppRoutes />
          <Toaster />
          <Sonner position="top-center" />
        </TooltipProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
