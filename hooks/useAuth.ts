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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('useAuth: Initializing authentication...');

  // Create supabase client with error handling - memoized to prevent infinite re-renders
  const [supabase, setSupabase] = useState<any>(null);
  const [clientLoading, setClientLoading] = useState(true);

  // Initialize Supabase client asynchronously
  useEffect(() => {
    const initClient = async () => {
      try {
        console.log('Initializing Supabase client...');
        const client = await getSupabaseClientAsync();
        
        if (client) {
          console.log('Async Supabase client created successfully');
          setSupabase(client);
        } else {
          console.error('Failed to create async Supabase client');
          // Fallback to sync client
          const syncClient = getSupabaseClient();
          if (syncClient) {
            console.log('Fallback to sync client successful');
            setSupabase(syncClient);
          }
        }
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
        // Try fallback sync client
        try {
          const syncClient = getSupabaseClient();
          if (syncClient) {
            console.log('Fallback sync client created');
            setSupabase(syncClient);
          }
        } catch (syncError) {
          console.error('Fallback sync client also failed:', syncError);
        }
      } finally {
        setClientLoading(false);
      }
    };

    initClient();
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      console.log('Starting getInitialSession...');

      // Wait for client to be ready
      if (clientLoading) {
        console.log('Client still loading, waiting...');
        return;
      }

      if (!supabase) {
        console.log('No Supabase client available, skipping auth');
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching session...');

        // Add timeout to prevent hanging - reduced for faster response
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session fetch timeout')), 2000);
        });

        const {
          data: { session },
          error,
        } = (await Promise.race([sessionPromise, timeoutPromise])) as any;

        if (error) {
          console.error('Auth error:', error);
          setUser(null);
          setProfile(null);
        } else {
          console.log(
            'Session result:',
            session ? 'User logged in' : 'No user session'
          );
          setUser(session?.user ?? null);

          // Load user profile if we have a user
          if (session?.user) {
            try {
              console.log('Loading user profile...');
              const { data: profileData } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

              console.log('Profile loaded:', !!profileData);
              setProfile(profileData);
            } catch (profileError) {
              console.error('Error loading profile:', profileError);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setProfile(null);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    // Start auth initialization
    getInitialSession();

    // Set up auth state listener
    let subscription: any = null;
    if (supabase) {
      try {
        const { data } = supabase.auth.onAuthStateChange(
          async (event: any, session: any) => {
            setUser(session?.user ?? null);

            if (!session?.user) {
              setProfile(null);
            } else {
              // Load user profile when auth state changes
              try {
                const { data: profileData } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();

                setProfile(profileData);
              } catch (profileError) {
                console.error(
                  'Error loading profile on auth change:',
                  profileError
                );
              }
            }
            setLoading(false);
          }
        );
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
  }, [supabase, clientLoading]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase not available') };

    console.log('Starting signIn process for:', email);
    setLoading(true);

    try {
      console.log('Attempting sign in...');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('SignIn result:', { error: !!error });

      if (error) {
        console.error('SignIn error:', error);
      }

      return { error };
    } catch (error) {
      console.error('SignIn catch block error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    if (!supabase) return { error: new Error('Supabase not available') };

    console.log('Starting signUp process for:', email);
    setLoading(true);

    try {
      // First, try a simple signup without redirect URL to isolate the issue
      console.log('Attempting basic signup...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('Signup result:', { data: !!data, error: !!error });

      if (error) {
        console.error('Signup error:', error);
        return { error };
      }

      if (data.user) {
        console.log('User created, attempting to create profile...');
        // Create user profile in database
        try {
          const { error: profileError } = await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: userData?.full_name || null,
            company_name: userData?.company_name || null,
            industry_type: userData?.industry_type || null,
            phone_number: userData?.phone_number || null,
          });

          if (profileError) {
            console.error('Error creating profile:', profileError);
            // Don't fail the whole signup for profile creation errors
          } else {
            console.log('Profile created successfully');
          }
        } catch (profileErr) {
          console.error('Profile creation failed:', profileErr);
        }
      }

      return { error };
    } catch (error) {
      console.error('Signup catch block error:', error);
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
