
import React from 'react';
import { UserProfile } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PenSquare, User } from 'lucide-react';

interface ProfileHeaderProps {
  user: UserProfile;
  isLoading?: boolean;
  isEditing?: boolean;
  onEditClick?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  user, 
  isLoading = false,
  isEditing = false,
  onEditClick
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
      <div className="relative group">
        {isLoading ? (
          <Skeleton className="h-20 w-20 rounded-full" />
        ) : (
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="space-y-1">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold truncate">{user?.full_name}</h2>
                <p className="text-sm text-muted-foreground">@{user?.username}</p>
                {user?.location && (
                  <p className="text-sm text-muted-foreground">{user.location}</p>
                )}
              </>
            )}
          </div>
          
          {!isLoading && !isEditing && onEditClick && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onEditClick}
              className="sm:ml-auto"
            >
              <PenSquare className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
        
        {user?.bio && !isEditing && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {user.bio}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
