
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, UserCheck, UserX, User, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Connection {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  user_id: string;
  connected_user_id: string;
  created_at: string;
  updated_at: string;
  connected_user?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    email?: string;
  };
}

interface SuggestedUser {
  id: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
}

const SocialConnections: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connectionsType, setConnectionsType] = useState<'accepted' | 'pending' | 'suggested'>('accepted');

  // Fetch user connections
  const { 
    data: connections,
    isLoading: connectionsLoading,
    refetch: refetchConnections
  } = useQuery({
    queryKey: ['connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return { accepted: [], pending: [], incoming: [] };

      // Fetch all connections where the user is either the requester or receiver
      const { data: allConnections, error } = await supabase
        .from('user_connections')
        .select(`
          id, status, user_id, connected_user_id, created_at, updated_at,
          connected_user:connected_user_id(id, full_name, avatar_url, email)
        `)
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);

      if (error) throw error;
      
      const accepted = allConnections.filter(
        conn => conn.status === 'accepted'
      );
      
      const pending = allConnections.filter(
        conn => conn.status === 'pending' && conn.user_id === user.id
      );
      
      const incoming = allConnections.filter(
        conn => conn.status === 'pending' && conn.connected_user_id === user.id
      );
      
      return { accepted, pending, incoming };
    },
    enabled: !!user?.id,
  });
  
  // Fetch suggested connections
  const { 
    data: suggestedUsers,
    isLoading: suggestedLoading,
  } = useQuery({
    queryKey: ['suggested-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // In a real app, this would implement a robust algorithm to suggest connections
      // For this demo, we'll just get some random profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .neq('id', user.id)
        .limit(5);
        
      if (error) throw error;
      
      // Filter out users that are already connected
      const connectedIds = new Set([
        ...connections.accepted.map(conn => 
          conn.user_id === user.id ? conn.connected_user_id : conn.user_id
        ),
        ...connections.pending.map(conn => conn.connected_user_id),
        ...connections.incoming.map(conn => conn.user_id)
      ]);
      
      return data.filter(suggestedUser => !connectedIds.has(suggestedUser.id));
    },
    enabled: !!user?.id && !!connections,
  });

  const handleConnect = async (targetUserId: string) => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_connections')
        .insert({
          user_id: user.id,
          connected_user_id: targetUserId,
          status: 'pending'
        });
        
      if (error) throw error;
      
      toast({
        title: "Connection request sent",
        description: "They'll be notified of your request",
      });
      
      refetchConnections();
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Failed to send request",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleAccept = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);
        
      if (error) throw error;
      
      toast({
        title: "Connection accepted",
        description: "You are now connected",
      });
      
      refetchConnections();
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast({
        title: "Failed to accept connection",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('id', connectionId);
        
      if (error) throw error;
      
      toast({
        title: "Request rejected",
        description: "Connection request has been declined",
      });
      
      refetchConnections();
    } catch (error) {
      console.error('Error rejecting connection:', error);
      toast({
        title: "Failed to reject request",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const renderConnectionsList = () => {
    if (!user?.id) return null;
    
    if (connectionsType === 'accepted') {
      return (
        <div className="space-y-4">
          {connections?.accepted.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
              <p>You haven't connected with anyone yet</p>
              <Button 
                variant="link" 
                onClick={() => setConnectionsType('suggested')}
                className="mt-2"
              >
                Find people to connect with
              </Button>
            </div>
          ) : (
            connections?.accepted.map(connection => {
              const connectedUser = connection.user_id === user.id 
                ? connection.connected_user 
                : { id: connection.user_id };
                
              return (
                <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={connectedUser?.avatar_url || ''} />
                      <AvatarFallback>
                        {connectedUser?.full_name?.charAt(0) || <User />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{connectedUser?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{connectedUser?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="bg-green-50">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      );
    }
    
    if (connectionsType === 'pending') {
      return (
        <div className="space-y-4">
          {connections?.incoming.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p>No pending requests</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Requests to Connect</h3>
              {connections?.incoming.map(connection => (
                <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={connection.connected_user?.avatar_url || ''} />
                      <AvatarFallback>
                        {connection.connected_user?.full_name?.charAt(0) || <User />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{connection.connected_user?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{connection.connected_user?.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAccept(connection.id)}
                    >
                      Accept
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleReject(connection.id)}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {connections?.pending.length > 0 && (
            <div className="space-y-2 mt-6">
              <h3 className="text-sm font-medium">Your Connection Requests</h3>
              {connections?.pending.map(connection => (
                <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={connection.connected_user?.avatar_url || ''} />
                      <AvatarFallback>
                        {connection.connected_user?.full_name?.charAt(0) || <User />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{connection.connected_user?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{connection.connected_user?.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (connectionsType === 'suggested') {
      return (
        <div className="space-y-4">
          {suggestedLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-9 w-20" />
              </div>
            ))
          ) : suggestedUsers?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No suggested connections available</p>
            </div>
          ) : (
            suggestedUsers?.map(suggestedUser => (
              <div key={suggestedUser.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={suggestedUser.avatar_url || ''} />
                    <AvatarFallback>
                      {suggestedUser.full_name?.charAt(0) || <User />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{suggestedUser.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{suggestedUser.email}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleConnect(suggestedUser.id)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Connect
                </Button>
              </div>
            ))
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          My Connections
        </CardTitle>
        <CardDescription>
          Connect with friends and discover places together
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-1 mb-4">
          <Button
            variant={connectionsType === 'accepted' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setConnectionsType('accepted')}
          >
            Connected
          </Button>
          <Button
            variant={connectionsType === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setConnectionsType('pending')}
          >
            Requests
            {connections?.incoming.length ? (
              <Badge variant="destructive" className="ml-1">
                {connections.incoming.length}
              </Badge>
            ) : null}
          </Button>
          <Button
            variant={connectionsType === 'suggested' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setConnectionsType('suggested')}
          >
            Find People
          </Button>
        </div>
        
        <ScrollArea className="h-80">
          {connectionsLoading ? (
            <div className="space-y-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[160px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            renderConnectionsList()
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SocialConnections;
