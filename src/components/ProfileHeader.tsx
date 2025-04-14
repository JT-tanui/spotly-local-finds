import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  id: string;
  full_name: string;
  username?: string;
  email: string;
  avatar_url?: string;
  website?: string;
  interests?: string[];
  past_bookings?: number;
  favorites?: number;
  bookings_count?: number;
  saved_count?: number;
  free_reservations?: number;
  loyalty_points?: number;
}

export interface ProfileHeaderProps {
  user: UserProfile;
  isLoading?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, isLoading = false }) => {
  return (
    <div className="flex items-center gap-4">
      {isLoading ? (
        <Skeleton className="h-16 w-16 rounded-full" />
      ) : (
        <Avatar>
          <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
          <AvatarFallback>{user?.full_name?.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      
      <div className="space-y-1">
        {isLoading ? (
          <>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold">{user?.full_name}</h2>
            <p className="text-sm text-muted-foreground">@{user?.username || 'username'}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
