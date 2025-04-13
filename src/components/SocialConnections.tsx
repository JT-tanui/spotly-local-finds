
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, UserPlus, UserCheck, Search, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import EmptyState from './EmptyState';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

type ConnectionStatus = 'connected' | 'pending' | 'not_connected';

interface ConnectionUser {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  status: ConnectionStatus;
}

interface PendingConnection {
  id: string;
  from_user_id: string;
  to_user_id: string;
  created_at: string;
  from_user?: UserProfile;
  to_user?: UserProfile;
}

const SocialConnections = () => {
  const [connections, setConnections] = useState<ConnectionUser[]>([]);
  const [suggestions, setSuggestions] = useState<ConnectionUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingConnection[]>([]);
  const [sentRequests, setSentRequests] = useState<PendingConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('connected');

  useEffect(() => {
    const fetchAllConnections = async () => {
      setLoading(true);
      
      try {
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch established connections
        const { data: connectionData, error: connectionError } = await supabase
          .from('user_connections')
          .select(`
            *,
            connected_profile:profiles!connected_user_id(id, full_name, email, avatar_url)
          `)
          .eq('user_id', user.id);

        if (connectionError) throw connectionError;
        
        // In a real implementation, we would fetch pending connections from a dedicated table
        // Since we don't have a connection_requests table, we'll use mock data
        
        // Fetch connection suggestions
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .neq('id', user.id)
          .limit(10);
          
        if (usersError) throw usersError;

        // Process connections
        const connectionsList = (connectionData || []).map(conn => ({
          id: conn.connected_profile?.id || '',
          full_name: conn.connected_profile?.full_name || 'Unknown User',
          email: conn.connected_profile?.email || '',
          avatar_url: conn.connected_profile?.avatar_url,
          status: 'connected' as ConnectionStatus
        }));
        
        // For pending requests and sent requests, we'll use mock data
        // In a real implementation, these would come from the database
        const mockPendingRequests = getMockPendingRequests();
        const mockSentRequests = getMockSentRequests();
        
        setPendingRequests(mockPendingRequests);
        setSentRequests(mockSentRequests);
        
        // Process suggestions, excluding connections and pending requests
        const connectionIds = new Set(connectionsList.map(c => c.id));
        const pendingIds = new Set(mockPendingRequests.map(r => r.from_user_id));
        const sentIds = new Set(mockSentRequests.map(r => r.to_user_id));
        
        const suggestionsList = (usersData || [])
          .filter(user => !connectionIds.has(user.id) && 
                         !pendingIds.has(user.id) && 
                         !sentIds.has(user.id))
          .map(user => ({
            ...user,
            status: 'not_connected' as ConnectionStatus
          }));
        
        setConnections(connectionsList);
        setSuggestions(suggestionsList);
      } catch (error: any) {
        console.error("Error fetching connections:", error);
        toast({
          title: "Error",
          description: "Failed to load connections.",
          variant: "destructive",
        });
        
        // Use mock data as fallback
        setConnections(getMockConnections());
        setSuggestions(getMockSuggestions());
      } finally {
        setLoading(false);
      }
    };

    fetchAllConnections();
    
    // Note: In a real implementation, we would set up real-time subscriptions
    // Since we're using mock data for pending requests, we won't implement that here
  }, [user, toast]);

  const handleAddConnection = async (connectedUserId: string) => {
    if (!user) return;

    try {
      // In a real implementation, we would create a connection request in the database
      
      // For now, we'll just update the UI
      setSuggestions(prev => 
        prev.filter(suggestion => suggestion.id !== connectedUserId)
      );
      
      const userToConnect = suggestions.find(s => s.id === connectedUserId);
      
      if (userToConnect) {
        setSentRequests(prev => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            from_user_id: user.id,
            to_user_id: connectedUserId,
            created_at: new Date().toISOString(),
            to_user: {
              id: userToConnect.id,
              full_name: userToConnect.full_name,
              email: userToConnect.email,
              avatar_url: userToConnect.avatar_url
            }
          }
        ]);
      }

      toast({
        title: "Success",
        description: "Connection request sent!",
      });
    } catch (error: any) {
      console.error("Error adding connection:", error);
      toast({
        title: "Error",
        description: "Failed to send connection request.",
        variant: "destructive",
      });
    }
  };
  
  const handleAcceptRequest = async (requestId: string, fromUserId: string) => {
    if (!user) return;

    try {
      // In a real implementation, we would update the request in the database and create connections
      
      // For now, we'll just update the UI
      const acceptedRequest = pendingRequests.find(req => req.id === requestId);
      
      if (acceptedRequest?.from_user) {
        // Add to connections
        setConnections(prev => [
          ...prev,
          {
            id: fromUserId,
            full_name: acceptedRequest.from_user!.full_name,
            email: acceptedRequest.from_user!.email,
            avatar_url: acceptedRequest.from_user!.avatar_url,
            status: 'connected'
          }
        ]);
      }
      
      // Remove from pending requests
      setPendingRequests(prev => 
        prev.filter(req => req.id !== requestId)
      );
      
      toast({
        title: "Success",
        description: "Connection accepted!",
      });
    } catch (error: any) {
      console.error("Error accepting connection:", error);
      toast({
        title: "Error",
        description: "Failed to accept connection.",
        variant: "destructive",
      });
    }
  };
  
  const handleRejectRequest = async (requestId: string) => {
    try {
      // In a real implementation, we would update the request in the database
      
      // For now, we'll just update the UI
      setPendingRequests(prev => 
        prev.filter(req => req.id !== requestId)
      );
      
      toast({
        title: "Request rejected",
        description: "Connection request has been rejected.",
      });
    } catch (error: any) {
      console.error("Error rejecting connection:", error);
      toast({
        title: "Error",
        description: "Failed to reject connection.",
        variant: "destructive",
      });
    }
  };
  
  const handleRemoveConnection = async (connectionId: string) => {
    if (!user) return;
    
    try {
      // In a real implementation, we would delete the connection from the database
      
      // For now, we'll just update the UI
      const removedConnection = connections.find(conn => conn.id === connectionId);
      
      setConnections(prev => 
        prev.filter(conn => conn.id !== connectionId)
      );
      
      // Add back to suggestions
      if (removedConnection) {
        setSuggestions(prev => [
          ...prev,
          {
            ...removedConnection,
            status: 'not_connected'
          }
        ]);
      }
      
      toast({
        title: "Connection removed",
        description: "The connection has been removed.",
      });
    } catch (error: any) {
      console.error("Error removing connection:", error);
      toast({
        title: "Error",
        description: "Failed to remove connection.",
        variant: "destructive",
      });
    }
  };
  
  const handleCancelRequest = async (userId: string) => {
    if (!user) return;
    
    try {
      // In a real implementation, we would delete the request from the database
      
      // For now, we'll just update the UI
      setSentRequests(prev => 
        prev.filter(req => req.to_user_id !== userId)
      );
      
      // Get the user from sent requests
      const canceledUser = sentRequests.find(req => req.to_user_id === userId)?.to_user;
      
      // Add back to suggestions
      if (canceledUser) {
        setSuggestions(prev => [
          ...prev,
          {
            id: canceledUser.id,
            full_name: canceledUser.full_name,
            email: canceledUser.email,
            avatar_url: canceledUser.avatar_url,
            status: 'not_connected'
          }
        ]);
      }
      
      toast({
        title: "Request cancelled",
        description: "Connection request has been cancelled.",
      });
    } catch (error: any) {
      console.error("Error cancelling request:", error);
      toast({
        title: "Error",
        description: "Failed to cancel request.",
        variant: "destructive",
      });
    }
  };
  
  // Search functionality
  const filteredConnections = searchTerm 
    ? connections.filter(conn => 
        conn.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : connections;
  
  const filteredSuggestions = searchTerm
    ? suggestions.filter(sugg => 
        sugg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sugg.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : suggestions;

  // Mock data generators for testing
  const getMockConnections = (): ConnectionUser[] => [
    {
      id: 'user-1',
      full_name: 'Emily Johnson',
      email: 'emily@example.com',
      avatar_url: 'https://i.pravatar.cc/150?img=1',
      status: 'connected'
    },
    {
      id: 'user-2',
      full_name: 'Michael Chen',
      email: 'michael@example.com',
      avatar_url: 'https://i.pravatar.cc/150?img=3',
      status: 'connected'
    }
  ];
  
  const getMockSuggestions = (): ConnectionUser[] => [
    {
      id: 'user-3',
      full_name: 'Jane Doe',
      email: 'jane.doe@example.com',
      avatar_url: 'https://i.pravatar.cc/150?img=5',
      status: 'not_connected'
    },
    {
      id: 'user-4',
      full_name: 'John Smith',
      email: 'john.smith@example.com',
      avatar_url: 'https://i.pravatar.cc/150?img=11',
      status: 'not_connected'
    },
    {
      id: 'user-5',
      full_name: 'Sarah Williams',
      email: 'sarah@example.com',
      avatar_url: 'https://i.pravatar.cc/150?img=9',
      status: 'not_connected'
    }
  ];
  
  const getMockPendingRequests = (): PendingConnection[] => [
    {
      id: 'req-1',
      from_user_id: 'user-6',
      to_user_id: user?.id || '',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      from_user: {
        id: 'user-6',
        full_name: 'David Thompson',
        email: 'david@example.com',
        avatar_url: 'https://i.pravatar.cc/150?img=12'
      }
    }
  ];
  
  const getMockSentRequests = (): PendingConnection[] => [
    {
      id: 'req-2',
      from_user_id: user?.id || '',
      to_user_id: 'user-7',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      to_user: {
        id: 'user-7',
        full_name: 'Lisa Anderson',
        email: 'lisa@example.com',
        avatar_url: 'https://i.pravatar.cc/150?img=7'
      }
    }
  ];

  if (loading) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">My Connections</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32 mt-1" />
                </div>
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">My Connections</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage your connections and requests</p>
      </div>
      
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search connections..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="connected" className="relative">
              <div className="flex flex-col items-center">
                <span>Connected</span>
                {connections.length > 0 && (
                  <span className="text-xs text-muted-foreground">{connections.length}</span>
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              <div className="flex flex-col items-center">
                <span>Requests</span>
                {pendingRequests.length > 0 && (
                  <div className="absolute -top-1 -right-1 bg-spotly-red text-white text-xs px-1.5 py-0.5 rounded-full">
                    {pendingRequests.length}
                  </div>
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger value="discover">
              <div className="flex flex-col items-center">
                <span>Discover</span>
                <span className="text-xs text-muted-foreground">{suggestions.length}</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="connected" className="animate-fade-in">
            <ScrollArea className="h-[300px]">
              {filteredConnections.length > 0 ? (
                <div className="space-y-3">
                  {filteredConnections.map(connection => (
                    <div key={connection.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={connection.avatar_url || undefined} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{connection.full_name}</p>
                          <p className="text-sm text-muted-foreground">{connection.email}</p>
                        </div>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline">Disconnect</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Connection</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {connection.full_name} from your connections? 
                              They will no longer be able to see your shared content.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveConnection(connection.id)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={UserCheck}
                  title="No connections yet"
                  description="Connect with other users to grow your network"
                />
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="requests" className="animate-fade-in">
            <ScrollArea className="h-[300px]">
              {pendingRequests.length > 0 ? (
                <div>
                  <h3 className="font-medium mb-2">Received Requests</h3>
                  <div className="space-y-3 mb-6">
                    {pendingRequests.map(request => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={request.from_user?.avatar_url || undefined} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.from_user?.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {request.from_user?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            Decline
                          </Button>
                          <Button 
                            onClick={() => handleAcceptRequest(request.id, request.from_user_id)}
                          >
                            Accept
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {sentRequests.length > 0 && (
                    <>
                      <h3 className="font-medium mb-2">Sent Requests</h3>
                      <div className="space-y-3">
                        {sentRequests.map(request => (
                          <div key={request.id} className="flex items-center justify-between p-4 border rounded-md">
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarImage src={request.to_user?.avatar_url || undefined} />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.to_user?.full_name || 'User'}</p>
                                <p className="text-sm text-muted-foreground">Pending</p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              onClick={() => handleCancelRequest(request.to_user_id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : sentRequests.length > 0 ? (
                <div>
                  <h3 className="font-medium mb-2">Sent Requests</h3>
                  <div className="space-y-3">
                    {sentRequests.map(request => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={request.to_user?.avatar_url || undefined} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.to_user?.full_name || 'User'}</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => handleCancelRequest(request.to_user_id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={UserPlus}
                  title="No pending requests"
                  description="You don't have any connection requests at the moment"
                />
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="discover" className="animate-fade-in">
            <ScrollArea className="h-[300px]">
              {filteredSuggestions.length > 0 ? (
                <div className="space-y-3">
                  {filteredSuggestions.map(suggestion => (
                    <div key={suggestion.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={suggestion.avatar_url || undefined} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{suggestion.full_name}</p>
                          <p className="text-sm text-muted-foreground">{suggestion.email}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => handleAddConnection(suggestion.id)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No suggestions available"
                  description="We'll show you connection suggestions as your network grows"
                />
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SocialConnections;
