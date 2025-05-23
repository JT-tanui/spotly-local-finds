
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Define user profile type
export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  user_id?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean; // Added for compatibility with existing code
  profile: UserProfile | null; 
  setProfile: (profile: UserProfile | null) => void;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!error && data?.session) {
          setUser(data.session.user);
          
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.session.user.id)
            .single();
            
          if (!profileError && profileData) {
            setProfile(profileData);
          }
        }
      } catch (e) {
        console.error('Error checking auth session:', e);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          
          // Fetch user profile on auth state change
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
              
            if (!profileError && profileData) {
              setProfile(profileData);
            }
          } catch (e) {
            console.error('Error fetching user profile:', e);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    isLoading: loading, // For compatibility with existing code
    profile,
    setProfile,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export the hook directly to avoid circular dependencies
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
