// Flynn.ai v2 - Next.js Middleware for Authentication
import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - debug pages (for troubleshooting)
     * - test pages (for isolated testing)
     */
    '/((?!_next/static|_next/image|favicon.ico|debug-env|test-supabase|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};