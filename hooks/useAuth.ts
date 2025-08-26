// Flynn.ai v2 - Authentication Hook
'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/types/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: any }>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  console.log('useAuth: Initializing...');
  
  // Create supabase client with error handling
  let supabase: any = null;
  try {
    console.log('Creating Supabase client...');
    supabase = createClient();
    console.log('Supabase client created successfully');
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
  }

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        
        if (!supabase) {
          console.log('No Supabase client available, skipping auth');
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        // Add aggressive timeout for Supabase calls
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Supabase timeout')), 3000)
        );

        const { data: { session }, error } = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]) as any;

        if (error) {
          console.error('Auth error:', error);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        console.log('Session retrieved:', !!session);
        setUser(session?.user ?? null);
        setLoading(false);

      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };

    // Start auth initialization
    getInitialSession();
    
    // Set up auth state listener if Supabase is available
    let subscription: any = null;
    if (supabase) {
      try {
        const { data } = supabase.auth.onAuthStateChange((event: any, session: any) => {
          console.log('Auth state change:', event, !!session?.user);
          setUser(session?.user ?? null);
          if (!session?.user) {
            setProfile(null);
          }
          // Always set loading to false when auth state changes
          setLoading(false);
        });
        subscription = data.subscription;
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        setLoading(false);
      }
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase not available') };
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    if (!supabase) return { error: new Error('Supabase not available') };
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/confirm`,
        },
      });

      if (!error && data.user) {
        // Create user profile in database
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: userData?.full_name || null,
            company_name: userData?.company_name || null,
            industry_type: userData?.industry_type || null,
            phone_number: userData?.phone_number || null,
          });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return { error };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    if (!supabase || !user) return { error: 'Not authenticated' };
    
    try {
      const { data: updatedProfile, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (!error && updatedProfile) {
        setProfile(updatedProfile);
        return { error: null };
      }
      
      return { error: error?.message || 'Failed to update profile' };
    } catch (error: any) {
      return { error: error?.message || 'Failed to update profile' };
    }
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
}