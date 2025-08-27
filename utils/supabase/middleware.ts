// Flynn.ai v2 - Supabase Middleware for Authentication
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from '@/types/database.types';

// Sanitize environment variables
const sanitizeEnvVar = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  return value.trim().replace(/[\r\n\t]/g, '');
};

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();

  // Skip auth processing for public routes
  const { pathname } = request.nextUrl;
  const isPublicRoute = pathname === '/' || 
                       pathname.startsWith('/api/webhooks') ||
                       pathname.startsWith('/_next') ||
                       pathname.startsWith('/favicon');
  
  if (isPublicRoute) {
    return response;
  }

  // Check if environment variables are available
  const supabaseUrl = sanitizeEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = sanitizeEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  try {
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Only refresh session for auth-required routes
    await supabase.auth.getUser();

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return response;
  }
}