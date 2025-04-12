
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PlaceDetails from "./pages/PlaceDetails";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import GroupEvents from "./pages/GroupEvents";  // Renamed from Saved
import LocationPicker from "./pages/LocationPicker";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import TopNav from "./components/TopNav";
import { useIsTablet, useIsDesktop } from "./hooks/useMediaQuery";
import AuthContextProvider from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import AppConfig from "./config";

import "./index.css";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const isTabletOrDesktop = useIsTablet() || useIsDesktop();
  
  return (
    <>
      {isTabletOrDesktop && <TopNav />}
      <div className={`max-w-6xl mx-auto min-h-screen relative bg-background ${isTabletOrDesktop ? 'pt-16' : ''}`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/place/:id" element={<PlaceDetails />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/events" element={<GroupEvents />} />
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
    <TooltipProvider>
      <AuthContextProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
