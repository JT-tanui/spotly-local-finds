
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { Event, Place, UserProfile } from '@/types';

const SUPABASE_URL = "https://eawzznzovrgfxdbcdwzv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhd3p6bnpvdnJnZnhkYmNkd3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzIzNjksImV4cCI6MjA1OTk0ODM2OX0.T5LFZfpEROIdInGASQinJWhBW9kMw9N9Aad5BYqQ4mo";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Updated helper function to convert Supabase data to our app types
export const mapDbEventToEvent = (dbEvent: any, places?: Place[]): Event => {
  const place = places?.find(p => p.id === dbEvent.place_id);
  
  return {
    id: dbEvent.id,
    creator_id: dbEvent.creator_id,
    place_id: dbEvent.place_id,
    title: dbEvent.title,
    description: dbEvent.description || null,
    event_date: dbEvent.event_date,
    created_at: dbEvent.created_at,
    max_participants: dbEvent.max_participants || null,
    status: dbEvent.status as 'active' | 'cancelled' | 'completed',
    participants: dbEvent.participants || [],
    creator: dbEvent.creator,
    place: place
  };
};

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Helper function to format dates for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
};
