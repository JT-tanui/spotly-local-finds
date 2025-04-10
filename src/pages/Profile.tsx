
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Ticket, Star, LogOut, 
  MapPin, CalendarDays, Heart, Settings, Bell, 
  Share2, HelpCircle, CreditCard, Gift
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlacesList from '@/components/PlacesList';
import { usePlaces } from '@/hooks/usePlaces';
import { useLocation } from '@/hooks/useLocation';
import { useIsDesktop, useIsTablet } from '@/hooks/useMediaQuery';

const Profile = () => {
  const navigate = useNavigate();
  const { location } = useLocation();
  const { featuredPlaces, allPlaces } = usePlaces(location);
  const isDesktop = useIsDesktop();
  const isTablet = useIsTablet();
  
  // Mock user data - in a real app this would come from auth context
  const user = {
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://i.pravatar.cc/150?img=23",
    freeReservations: 1,
    joinedDate: "November 2023",
    bookingsCount: 12,
    savedCount: 8,
    loyaltyPoints: 350,
    referralCode: "SARAH-2025"
  };

  // Use first 3 places as mock favorites
  const [favorites] = useState(featuredPlaces.slice(0, 3));
  const [pastBookings] = useState(allPlaces.slice(0, 2));

  const [activeTab, setActiveTab] = useState("overview");
  
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
    <div className={`pt-[62px] pb-20 ${isDesktop ? 'px-8' : 'px-4'}`}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Button variant="ghost" size="sm" onClick={() => setActiveTab("settings")}>
          <Settings className="h-4 w-4 mr-1" />
          Settings
        </Button>
      </div>
      
      {/* Main Content - Responsive Layout */}
      <div className={`${isDesktop ? 'grid grid-cols-3 gap-6' : 'flex flex-col gap-4'}`}>
        {/* Left Column (Profile Card, Stats) */}
        <div className={`${isDesktop ? 'col-span-1' : ''}`}>
          {/* User Card */}
          <Card className="mb-6 animate-fade-in">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar className="h-20 w-20 border-2 border-spotly-red">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback><User /></AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <CardTitle>{user.name}</CardTitle>
                <CardDescription className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  {user.email}
                </CardDescription>
                {isTablet || isDesktop ? (
                  <CardDescription className="flex items-center mt-1">
                    <Phone className="h-3 w-3 mr-1" />
                    {user.phone}
                  </CardDescription>
                ) : null}
                <CardDescription className="text-xs mt-2">
                  Member since {user.joinedDate}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 py-2">
                <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-lg font-bold text-spotly-red">{user.bookingsCount}</span>
                  <span className="text-xs text-muted-foreground">Bookings</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-lg font-bold text-spotly-red">{user.savedCount}</span>
                  <span className="text-xs text-muted-foreground">Saved</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-lg font-bold text-spotly-red">{user.freeReservations}</span>
                  <span className="text-xs text-muted-foreground">Free Passes</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="flex items-center">
                    <Ticket className="h-4 w-4 mr-1 text-green-600" />
                    Loyalty points
                  </span>
                  <span className="font-medium">{user.loyaltyPoints} pts</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-spotly-red to-spotly-blue h-2 rounded-full" 
                    style={{ width: `${Math.min((user.loyaltyPoints / 500) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  150 points until next free reservation
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab("settings")}
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
          
          {/* Quick Actions */}
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
              onClick={() => navigate('/saved')}
            >
              <Heart className="h-5 w-5 mb-1 text-spotly-red" />
              <span className="text-xs">Saved</span>
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
          
          {/* Referral Card - Desktop and Tablet Only */}
          {(isDesktop || isTablet) && (
            <Card className="mb-6 bg-gradient-mint">
              <CardHeader>
                <CardTitle className="text-lg">Refer a Friend</CardTitle>
                <CardDescription>
                  Share Spotly and both get a free reservation!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white/80 p-3 rounded-md text-center mb-3">
                  <p className="font-mono font-bold">{user.referralCode}</p>
                </div>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(`Join me on Spotly! Use code ${user.referralCode} to get your first reservation free.`);
                    toast({ title: "Copied to clipboard", description: "Share this with your friends!" });
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Referral Link
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right/Main Column (Content) */}
        <div className={`${isDesktop ? 'col-span-2' : ''}`}>
          {/* Tabs for profile content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="animate-fade-in">
              {/* Saved Places */}
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
                  <div className={`grid ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                    {favorites.map((place) => (
                      <div 
                        key={place.id}
                        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow animate-fade-in cursor-pointer"
                        onClick={() => handlePlaceClick(place)}
                      >
                        <div className="relative h-32">
                          <img 
                            src={place.imageUrl} 
                            alt={place.name} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-0 right-0 bg-black/60 text-white text-xs px-2 py-1 rounded-bl-lg">
                            {place.distance} km
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold truncate">{place.name}</h3>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{place.category}</span>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                              <span className="text-xs">{place.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
              
              {/* Recent Bookings */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">Recent Bookings</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/bookings')}>
                    View All
                  </Button>
                </div>
                
                {pastBookings.length > 0 ? (
                  <div className="space-y-3">
                    {pastBookings.map((booking, index) => (
                      <Card key={`booking-${index}`} className="overflow-hidden">
                        <div className="flex">
                          <div className="w-24 h-24">
                            <img 
                              src={booking.imageUrl} 
                              alt={booking.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3 flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-semibold">{booking.name}</h3>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                Completed
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              April {10 - index}, 2025 • 7:30 PM
                            </p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-muted-foreground">
                                {booking.category}
                              </span>
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="h-auto p-0 text-spotly-red"
                                onClick={() => handlePlaceClick(booking)}
                              >
                                Book Again
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg py-8 text-center">
                    <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">No bookings yet</p>
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
            </TabsContent>
            
            <TabsContent value="settings" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Personal Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your name, email, and phone number
                    </p>
                    <Button variant="outline" size="sm">Edit Profile</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Notification Preferences</h3>
                    <p className="text-sm text-muted-foreground">
                      Control which notifications you receive
                    </p>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Bell className="h-4 w-4 mr-2" />
                      Manage Notifications
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Payment Methods</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your payment methods and billing information
                    </p>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Payment Methods
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="help" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Help & Support</CardTitle>
                  <CardDescription>
                    Find answers to common questions and get help
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start text-left" size="sm">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      How do I make a reservation?
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left" size="sm">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Can I cancel my reservation?
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left" size="sm">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      How do I earn free reservations?
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left" size="sm">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Contact Support Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
