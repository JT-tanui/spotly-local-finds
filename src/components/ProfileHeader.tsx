import React from 'react';
import { User, Mail, Phone, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types';
import { useAuth } from '@/hooks/useAuthContext';

interface ProfileHeaderProps {
  user: UserProfile;
  onEditProfile: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEditProfile }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account.",
    });
    setTimeout(() => navigate('/'), 1000);
  };

  return (
    <Card className="mb-6 animate-fade-in">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-20 w-20 border-2 border-spotly-red">
          <AvatarImage src={user.avatar_url || ''} alt={user.full_name || 'User'} />
          <AvatarFallback><User /></AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle>{user.full_name || 'User'}</CardTitle>
          <CardDescription className="flex items-center">
            <Mail className="h-3 w-3 mr-1" />
            {user.email || 'No email provided'}
          </CardDescription>
          <CardDescription className="flex items-center mt-1">
            <Phone className="h-3 w-3 mr-1" />
            {user.phone || 'No phone provided'}
          </CardDescription>
          <CardDescription className="text-xs mt-2">
            Member since {new Date(user.created_at).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats content would go here */}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onEditProfile}
        >
          Edit Profile
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-1" />
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileHeader;
