import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

const SocialConnections = () => {
  const [connections, setConnections] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchConnections = async () => {
      if (!user) return;

      try {
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

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">My Connections</h2>
      {connections.length === 0 ? (
        <p>No connections yet.</p>
      ) : (
        <div className="space-y-3">
          {connections.map(connection => (
            <div key={connection.connected_profile.id} className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={connection.connected_profile.avatar_url} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{connection.connected_profile.full_name}</p>
                  <p className="text-sm text-muted-foreground">{connection.connected_profile.email}</p>
                </div>
              </div>
              <Button variant="outline" disabled>Connected</Button>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold mt-6 mb-4">Find New Connections</h2>
      {/* Implement a search or suggestion mechanism here to find new users */}
      {/* For demonstration purposes, let's add a static list of potential connections */}
      <div className="space-y-3">
        {/* Example user - replace with actual data */}
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
        {/* Add more example users as needed */}
      </div>
    </div>
  );
};

export default SocialConnections;
