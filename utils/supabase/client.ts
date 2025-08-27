// Flynn.ai v2 - Supabase Client (Client-side)
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('Missing Supabase environment variables:', {
      url: !!url,
      anonKey: !!anonKey,
      urlValue: url,
    });
    throw new Error('Missing required Supabase environment variables');
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    console.error('Invalid Supabase URL:', url);
    throw new Error('Invalid Supabase URL format');
  }

  return createBrowserClient<Database>(url, anonKey);
};

// Export a function to get client safely
let clientInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
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

// Export a default client instance for convenience (with error handling)
export const supabase = (() => {
  try {
    return createClient();
  } catch (error) {
    console.error('Failed to create default Supabase client:', error);
    return null;
  }
})();