
import AppConfig from '@/config';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types';

// Fetch user profile from Supabase
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

// Mock data for development mode
export const mockUser = {
  id: "mock-user-id",
  email: "sarah@example.com",
};

export const mockProfile = {
  id: "mock-user-id",
  full_name: "Sarah Johnson",
  email: "sarah@example.com",
  phone: "+1 (555) 123-4567",
  avatar_url: "https://i.pravatar.cc/150?img=23",
  created_at: new Date("2023-11-01").toISOString(),
};
