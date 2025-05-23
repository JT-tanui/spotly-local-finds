
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import PlaceDetails from '@/pages/PlaceDetails';
import Bookings from '@/pages/Bookings';
import GroupEvents from '@/pages/GroupEvents';
import LocationPicker from '@/pages/LocationPicker';
import Inbox from '@/pages/Inbox';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import Onboarding from '@/pages/Onboarding';
import Checkout from '@/pages/Checkout';
import BottomNav from '@/components/BottomNav';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/hooks/useTheme';

const queryClient = new QueryClient();

function App() {
  const [viewMode, setViewMode] = useState<string>(() => {
    return localStorage.getItem('layoutMode') || 'standard';
  });

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    localStorage.setItem('layoutMode', mode);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-background">
              <Routes>
                <Route path="/" element={
                  <Index 
                    key={viewMode} 
                    initialViewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                  />
                } />
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/place/:id" element={<PlaceDetails />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/events" element={<GroupEvents />} />
                <Route path="/location" element={<LocationPicker />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNav />
              <Toaster />
            </div>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
