// Flynn.ai v2 - Supabase Client (Client-side)
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

// Sanitize environment variables
const sanitizeEnvVar = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  return value.trim().replace(/[\r\n\t]/g, '');
};

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

// Single client instance with proper error handling
let clientInstance: ReturnType<typeof createClient> | null = null;

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

  // Client-side: use singleton
  if (!clientInstance) {
    try {
      clientInstance = createClient();
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      return null;
    }
  }
  return clientInstance;
};

// Default export for convenience
export const supabase = getSupabaseClient();