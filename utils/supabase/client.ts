// Flynn.ai v2 - Supabase Client (Client-side)
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

// Runtime configuration cache
let runtimeConfig: { supabaseUrl: string; supabaseAnonKey: string } | null = null;

// Fetch runtime configuration from API
const getRuntimeConfig = async () => {
  if (runtimeConfig) return runtimeConfig;
  
  try {
    const response = await fetch('/api/config');
    const config = await response.json();
    
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      throw new Error('Missing Supabase configuration in API response');
    }
    
    runtimeConfig = {
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey
    };
    
    console.log('Runtime config loaded successfully');
    return runtimeConfig;
  } catch (error) {
    console.error('Failed to fetch runtime config:', error);
    throw error;
  }
};

// Sanitize environment variables
const sanitizeEnvVar = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  return value.trim().replace(/[\r\n\t]/g, '');
};

// Synchronous createClient for server-side
export const createClient = () => {
  const url = sanitizeEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = sanitizeEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    throw new Error('Invalid Supabase URL format');
  }

  return createBrowserClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
    },
  });
};

// Async createClient for client-side with runtime config
export const createClientAsync = async () => {
  if (typeof window === 'undefined') {
    // Server-side: use synchronous version
    return createClient();
  }

  // Client-side: use runtime config
  const config = await getRuntimeConfig();
  const url = sanitizeEnvVar(config.supabaseUrl);
  const anonKey = sanitizeEnvVar(config.supabaseAnonKey);

  if (!url || !anonKey) {
    throw new Error('Missing Supabase configuration from runtime');
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    throw new Error('Invalid Supabase URL format');
  }

  console.log('Creating Supabase client with runtime config');
  return createBrowserClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
    },
  });
};

// Single client instance with proper error handling
let clientInstance: ReturnType<typeof createClient> | null = null;
let clientPromise: Promise<ReturnType<typeof createClient>> | null = null;

export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // Server-side: create new client each time
    try {
      return createClient();
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      return null;
    }
  }

  // Client-side: use singleton - but this is now problematic for async config
  if (!clientInstance) {
    try {
      clientInstance = createClient();
    } catch (error) {
      console.error('Failed to create Supabase client with env vars, will need async approach:', error);
      return null;
    }
  }
  return clientInstance;
};

// New async version for client-side
export const getSupabaseClientAsync = async () => {
  if (typeof window === 'undefined') {
    // Server-side: create new client each time
    try {
      return createClient();
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      return null;
    }
  }

  // Client-side: use async singleton
  if (!clientPromise) {
    clientPromise = createClientAsync().catch((error) => {
      console.error('Failed to create async Supabase client:', error);
      clientPromise = null; // Reset promise on failure
      throw error;
    });
  }
  
  try {
    return await clientPromise;
  } catch (error) {
    return null;
  }
};

// Default export for convenience (fallback)
export const supabase = getSupabaseClient();
