// Flynn.ai v2 - Webhook Debug Info Endpoint
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const webhookUrls = {
    voice: process.env.TWILIO_VOICE_URL,
    status: process.env.TWILIO_STATUS_URL,
    recording: process.env.TWILIO_RECORDING_URL,
    transcription: process.env.TWILIO_TRANSCRIPTION_URL,
    dtmf: process.env.TWILIO_DTMF_URL,
    mediaStream: process.env.TWILIO_MEDIA_STREAM_URL,
  };

  const debugInfo = {
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    webhookUrls,
    supabaseConfig: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    twilioConfig: {
      hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
      hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    },
    aiConfig: {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    },
    requestHeaders: {
      host: request.headers.get('host'),
      userAgent: request.headers.get('user-agent'),
      forwarded: request.headers.get('x-forwarded-for'),
      ngrokInfo: request.headers.get('ngrok-trace-id'),
    },
  };

  return NextResponse.json(debugInfo, { 
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  console.log('🔍 Debug webhook received:', {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    body: body,
  });

  return NextResponse.json({ 
    received: true, 
    timestamp: new Date().toISOString(),
    echo: body 
  });
}