// Flynn.ai v2 - Supabase Client (Server-side)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

// Sanitize environment variables to avoid hidden whitespace/newlines causing invalid keys
const sanitizeEnvVar = (value: string | undefined): string => {
  if (!value) throw new Error('Missing required environment variable');
  return value.trim().replace(/[\r\n\t]/g, '');
};

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient<Database>(
    sanitizeEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL),
    sanitizeEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle the case where cookies can't be set (e.g., in RSC)
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle the case where cookies can't be removed
          }
        },
      },
    }
  );
};

// Create service role client for admin operations
export const createAdminClient = () => {
  return createServerClient<Database>(
    sanitizeEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL),
    sanitizeEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY),
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {
          // No-op for admin client
        },
        remove() {
          // No-op for admin client
        },
      },
    }
  );
};
