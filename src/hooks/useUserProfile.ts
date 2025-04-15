
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types';
import { useAuth } from './useAuthContext';
import { useToast } from './use-toast';

export function useUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch the user profile
  const { 
    data: profile, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      // Fetch loyalty points from separate table
      const { data: loyaltyData } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      // Get reservation count
      const { count: bookingsCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      // For this example, we'll mock some stats since we don't have the actual tables
      // Format the profile data to match our UserProfile type
      const formattedProfile: UserProfile = {
        ...data,
        stats: {
          bookings_count: bookingsCount || 0,
          saved_count: 0, // Mock data, would get from a saved_places table
          free_reservations: loyaltyData?.points ? Math.floor(loyaltyData.points / 500) : 0,
          loyalty_points: loyaltyData?.points || 0,
        }
      };
      
      return formattedProfile;
    },
    enabled: !!user?.id,
  });

  // Update the user profile
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedProfile: Partial<UserProfile>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Extract stats from the update if present
      const { stats, ...profileData } = updatedProfile;
      
      // Update profile data
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update loyalty points if included in the update
      if (stats && stats.loyalty_points !== undefined) {
        const { error: loyaltyError } = await supabase
          .from('loyalty_points')
          .update({ points: stats.loyalty_points })
          .eq('user_id', user.id);
          
        if (loyaltyError) throw loyaltyError;
      }
      
      return updatedProfile;
    },
    onSuccess: (data) => {
      // Invalidate and refetch the profile query
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      console.error('Error updating profile:', error);
      
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
      });
    }
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    isUpdating,
    refetch
  };
}
