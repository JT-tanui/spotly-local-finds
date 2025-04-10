
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Ticket, Star, LogOut, 
  MapPin, CalendarDays, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import PlacesList from '@/components/PlacesList';
import { usePlaces } from '@/hooks/usePlaces';
import { useLocation } from '@/hooks/useLocation';

const Profile = () => {
  const navigate = useNavigate();
  const { location } = useLocation();
  const { featuredPlaces } = usePlaces(location);
  
  // Mock user data - in a real app this would come from auth context
  const user = {
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "https://i.pravatar.cc/150?img=23",
    freeReservations: 1
  };

  // Use first 3 places as mock favorites
  const [favorites] = useState(featuredPlaces.slice(0, 3));
  
  const handleSignOut = () => {
    // In a real app, this would call your auth signout method
    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account.",
    });
    // Redirect to home page after signout
    setTimeout(() => navigate('/'), 1000);
  };
  
  const handlePlaceClick = (place: any) => {
    navigate(`/place/${place.id}`);
  };
  
  return (
    <div className="pt-[62px] pb-20 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-1" />
          Sign Out
        </Button>
      </div>
      
      {/* User Card */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback><User /></AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle>{user.name}</CardTitle>
            <CardDescription className="flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              {user.email}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="flex items-center">
              <Ticket className="h-4 w-4 mr-1 text-green-600" />
              Free reservations remaining
            </span>
            <span className="font-medium">{user.freeReservations}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Button 
          variant="outline" 
          className="flex flex-col h-auto py-4"
          onClick={() => navigate('/bookings')}
        >
          <CalendarDays className="h-5 w-5 mb-1" />
          <span className="text-xs">Bookings</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex flex-col h-auto py-4"
          onClick={() => navigate('/saved')}
        >
          <Heart className="h-5 w-5 mb-1" />
          <span className="text-xs">Saved</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex flex-col h-auto py-4"
          onClick={() => navigate('/location')}
        >
          <MapPin className="h-5 w-5 mb-1" />
          <span className="text-xs">Location</span>
        </Button>
      </div>
      
      {/* Favorite Places */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Saved Places</h2>
          {favorites.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/saved')}>
              View All
            </Button>
          )}
        </div>
        
        {favorites.length > 0 ? (
          <PlacesList 
            places={favorites} 
            loading={false} 
            onPlaceClick={handlePlaceClick}
          />
        ) : (
          <div className="border rounded-lg py-8 text-center">
            <Heart className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No saved places yet</p>
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="mt-1"
            >
              Explore places
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
