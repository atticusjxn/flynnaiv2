import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables (without exposing sensitive data)
    const envCheck = {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'MISSING',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV || 'unknown',
      VERCEL_ENV: process.env.VERCEL_ENV || 'not-vercel',
    };

    // Check if keys have proper format
    const diagnostics = {
      supabase_url_valid: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co') || false,
      anon_key_format: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ') || false,
      service_key_format: process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ') || false,
    };

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      diagnostics: diagnostics,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to check environment',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}