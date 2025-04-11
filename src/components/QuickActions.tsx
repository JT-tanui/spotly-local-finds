
import React from 'react';
import { CalendarDays, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <Button 
        variant="outline" 
        className="flex flex-col h-auto py-4 bg-gradient-to-b from-white to-slate-50"
        onClick={() => navigate('/bookings')}
      >
        <CalendarDays className="h-5 w-5 mb-1 text-spotly-red" />
        <span className="text-xs">Bookings</span>
      </Button>
      <Button 
        variant="outline" 
        className="flex flex-col h-auto py-4 bg-gradient-to-b from-white to-slate-50"
        onClick={() => navigate('/events')}
      >
        <Heart className="h-5 w-5 mb-1 text-spotly-red" />
        <span className="text-xs">Events</span>
      </Button>
      <Button 
        variant="outline" 
        className="flex flex-col h-auto py-4 bg-gradient-to-b from-white to-slate-50"
        onClick={() => navigate('/location')}
      >
        <MapPin className="h-5 w-5 mb-1 text-spotly-red" />
        <span className="text-xs">Location</span>
      </Button>
    </div>
  );
};

export default QuickActions;
