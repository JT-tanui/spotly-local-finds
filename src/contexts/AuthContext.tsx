
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import AppConfig from '../config';
import { UserProfile } from '@/types';
import { mockUser, mockProfile, fetchUserProfile } from '@/utils/authUtils';
import { signInWithEmailAndPassword, signUpWithEmailAndPassword, signOut as authSignOut } from '@/services/authService';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  setProfile: (profile: UserProfile) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthContextProviderProps {
  children: React.ReactNode;
}

export default function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!session || (AppConfig.skipAuthentication && !!mockUser);

  const fetchProfileCallback = useCallback(async (userId: string) => {
    const profileData = await fetchUserProfile(userId);
    if (profileData) {
      setProfile(profileData);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        if (AppConfig.skipAuthentication) {
          // Use mock data in debug mode
          setUser(mockUser as User);
          setProfile(mockProfile);
          setIsLoading(false);
          return;
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            // Only fetch profile when user changes and is logged in
            if (currentSession?.user) {
              // Use setTimeout to prevent deadlock with Supabase client
              setTimeout(() => {
                fetchProfileCallback(currentSession.user.id);
              }, 0);
            }
          }
        );

        // Check for existing session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        
        if (existingSession?.user) {
          await fetchProfileCallback(existingSession.user.id);
        }

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [fetchProfileCallback]);

  const signIn = async (email: string, password: string) => {
    try {
      if (AppConfig.skipAuthentication) {
        toast({
          title: "Development mode",
          description: "Using mock user in development mode",
        });
        return;
      }
      
      const { data, error } = await signInWithEmailAndPassword(email, password);
      
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });

      // Redirect to home or original intended destination
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    try {
      if (AppConfig.skipAuthentication) {
        toast({
          title: "Development mode",
          description: "Using mock user in development mode",
        });
        return;
      }
      
      const { data, error } = await signUpWithEmailAndPassword(email, password, metadata);
      
      if (error) throw error;
      
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      
      // Redirect to onboarding
      navigate('/onboarding');
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: "Sign up failed",
        description: error.message || "Please try again with a different email.",
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      if (AppConfig.skipAuthentication) {
        toast({
          title: "Development mode",
          description: "Sign out not required in development mode",
        });
        return;
      }
      
      const { error } = await authSignOut();
      
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const contextValue: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
    setProfile,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
