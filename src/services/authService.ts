
import { supabase } from '@/integrations/supabase/client';
import AppConfig from '@/config';

export const signInWithEmailAndPassword = async (email: string, password: string) => {
  if (AppConfig.skipAuthentication) {
    return { data: null, error: null };
  }
  
  // Use dummy credentials if in debug mode with dummy auth enabled
  if (AppConfig.debug && AppConfig.useDummyAuth) {
    email = AppConfig.dummyAuthCredentials.email;
    password = AppConfig.dummyAuthCredentials.password;
  }
  
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signUpWithEmailAndPassword = async (
  email: string, 
  password: string, 
  metadata?: { full_name?: string }
) => {
  if (AppConfig.skipAuthentication) {
    return { data: null, error: null };
  }
  
  return await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: metadata
    }
  });
};

export const signOut = async () => {
  if (AppConfig.skipAuthentication) {
    return { error: null };
  }
  
  return await supabase.auth.signOut();
};
