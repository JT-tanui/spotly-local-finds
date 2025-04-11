
import React from 'react';
import { Ticket, Star } from 'lucide-react';
import { CardContent } from '@/components/ui/card';

interface ProfileStatsProps {
  bookingsCount: number;
  savedCount: number;
  freeReservations: number;
  loyaltyPoints: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  bookingsCount,
  savedCount,
  freeReservations,
  loyaltyPoints,
}) => {
  return (
    <CardContent>
      <div className="grid grid-cols-3 gap-2 py-2">
        <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
          <span className="text-lg font-bold text-spotly-red">{bookingsCount}</span>
          <span className="text-xs text-muted-foreground">Bookings</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
          <span className="text-lg font-bold text-spotly-red">{savedCount}</span>
          <span className="text-xs text-muted-foreground">Saved</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
          <span className="text-lg font-bold text-spotly-red">{freeReservations}</span>
          <span className="text-xs text-muted-foreground">Free Passes</span>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="flex items-center">
            <Ticket className="h-4 w-4 mr-1 text-green-600" />
            Loyalty points
          </span>
          <span className="font-medium">{loyaltyPoints} pts</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-spotly-red to-spotly-blue h-2 rounded-full" 
            style={{ width: `${Math.min((loyaltyPoints / 500) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {500 - loyaltyPoints > 0 ? `${500 - loyaltyPoints} points until next free reservation` : 'You earned a free reservation!'}
        </p>
      </div>
    </CardContent>
  );
};

export default ProfileStats;
