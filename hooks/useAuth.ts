// Flynn.ai v2 - Authentication Hook
'use client';

import { useEffect, useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { getSupabaseClient, getSupabaseClientAsync } from '@/utils/supabase/client';
import { Database } from '@/types/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
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

export function useAuth(): AuthState {
  // V3 NUCLEAR CACHE BUST - Completely static state - no API calls, no effects, no Supabase clients
  console.log('useAuth: v3.0 NUCLEAR CACHE BUST - Static stub only - NO SUPABASE CLIENTS');

  const staticState = {
    user: null,
    profile: null,
    loading: false,
  };

  // No useEffect, no useState - completely static

  const signIn = async (email: string, password: string) => {
    console.log('useAuth signIn: DISABLED - Use Server Actions for authentication');
    return { error: new Error('Use Server Actions for authentication') };
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    console.log('useAuth signUp: DISABLED - Use Server Actions for authentication');
    return { error: new Error('Use Server Actions for authentication') };
  };

  const signOut = async () => {
    console.log('useAuth signOut: DISABLED - Use Server Actions for authentication');
  };

  const updateProfile = async (updates: any) => {
    console.log('useAuth updateProfile: DISABLED - Use Server Actions for authentication');
    return { error: new Error('Use Server Actions for authentication') };
  };

  return {
    user: staticState.user,
    profile: staticState.profile,
    loading: staticState.loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
}
