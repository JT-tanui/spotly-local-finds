import React, { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuthContext must be used within an AuthContextProvider');
  }
  return context;
}

export function useAuth() {
  return useAuthContext();
}
