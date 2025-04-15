
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
      
      // Format the profile data to match our UserProfile type
      const formattedProfile: UserProfile = {
        ...data,
        stats: {
          bookings_count: data.bookings_count || 0,
          saved_count: data.saved_count || 0,
          free_reservations: data.free_reservations || 0,
          loyalty_points: data.loyalty_points || 0,
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
      
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', user.id);
      
      if (error) throw error;
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
