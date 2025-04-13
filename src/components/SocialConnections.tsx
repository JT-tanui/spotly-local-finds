
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

const SocialConnections = () => {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      
      try {
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_connections')
          .select(`
            *,
            connected_profile:profiles!connected_user_id(id, full_name, email, avatar_url)
          `)
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        setConnections(data || []);
      } catch (error: any) {
        console.error("Error fetching connections:", error);
        toast({
          title: "Error",
          description: "Failed to load connections.",
          variant: "destructive",
        });
        // Set connections to empty array to avoid undefined issues
        setConnections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [user, toast]);

  const handleAddConnection = async (connectedUserId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_connections')
        .insert([{ user_id: user.id, connected_user_id: connectedUserId }]);

      if (error) {
        throw error;
      }

      // Optimistically update the UI
      setConnections(prevConnections => [
        ...prevConnections,
        { user_id: user.id, connected_user_id: connectedUserId }
      ]);

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
    <div>
      <h2 className="text-lg font-semibold mb-4">My Connections</h2>
      {connections.length === 0 ? (
        <p>No connections yet.</p>
      ) : (
        <div className="space-y-3">
          {connections.map(connection => (
            <div key={connection.connected_profile?.id || connection.id} className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={connection.connected_profile?.avatar_url} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{connection.connected_profile?.full_name || 'Unknown User'}</p>
                  <p className="text-sm text-muted-foreground">{connection.connected_profile?.email || 'No email'}</p>
                </div>
              </div>
              <Button variant="outline" disabled>Connected</Button>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold mt-6 mb-4">Find New Connections</h2>
      <div className="space-y-3">
        {/* Example user suggestions */}
        <div className="flex items-center justify-between p-4 border rounded-md">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/150?img=5" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Jane Doe</p>
              <p className="text-sm text-muted-foreground">jane.doe@example.com</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => handleAddConnection("user-id-jane")}>
            Add Connection
          </Button>
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-md">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/150?img=11" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">John Smith</p>
              <p className="text-sm text-muted-foreground">john.smith@example.com</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => handleAddConnection("user-id-john")}>
            Add Connection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SocialConnections;
