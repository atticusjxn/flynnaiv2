// Flynn.ai v2 - Minimal Authentication Context Provider (for build compatibility)
'use client';

import { createContext, useContext, ReactNode } from 'react';

// Minimal auth context to prevent build errors
interface MinimalAuthContextType {
  user: null;
  profile: null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    userData?: any
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: any }>;
}

const MinimalAuthContext = createContext<MinimalAuthContextType | undefined>(undefined);

export function MinimalAuthProvider({ children }: { children: ReactNode }) {
  // Force client-side bundle rebuild - v2.1 complete auth cleanup
  console.log('MinimalAuthProvider: v2.1 - All client-side authentication disabled');
  
  const authValue: MinimalAuthContextType = {
    user: null,
    profile: null,
    loading: false, // Set to false to prevent loading states
    signIn: async () => ({ error: new Error('Use Server Actions for authentication') }),
    signUp: async () => ({ error: new Error('Use Server Actions for authentication') }),
    signOut: async () => {},
    updateProfile: async () => ({ error: new Error('Use Server Actions for authentication') }),
  };

  return <MinimalAuthContext.Provider value={authValue}>{children}</MinimalAuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(MinimalAuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within a MinimalAuthProvider');
  }
  return context;
}