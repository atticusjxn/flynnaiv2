import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { createCallRecord } from '@/lib/supabase/calls';
import {
  generateEnhancedCallHandlingTwiML,
  generateErrorTwiML,
  industryGreetings,
  IndustryType,
} from '@/lib/twilio/twiml';
import { initializeCallProcessing } from '@/lib/ai/CallProcessingManager';

export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio webhook
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const callStatus = formData.get('CallStatus') as string;
    const direction = formData.get('Direction') as string;

    // Get the authenticated user (for now, we'll need to determine user by phone number)
    const supabase = createAdminClient();

    // Find user by their Twilio phone number (this will be configured later)
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('twilio_phone_number', to)
      .single();

    if (!user) {
      console.error('No user found for phone number:', to);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create or update call record
    const callData = {
      user_id: user.id,
      twilio_call_sid: callSid,
      caller_number: from,
      call_status: callStatus as any,
      call_direction: direction as any,
      created_at: new Date().toISOString(),
    };

    const call = await createCallRecord(callData);

    // Initialize silent call processing management
    await initializeCallProcessing(callSid);

    // Get user's industry configuration for greeting
    const industry = (user.industry as IndustryType) || 'general';
    const greeting = industryGreetings[industry];

    // Generate enhanced TwiML response with DTMF detection and media streams
    const twimlResponse = generateEnhancedCallHandlingTwiML(
      callSid,
      {
        message: greeting,
        voice: 'alice',
      },
      {
        maxLength: 600, // 10 minutes
        transcribe: false,
        playBeep: true,
      }
    );

    return new NextResponse(twimlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Twilio voice webhook error:', error);

    // Return a basic TwiML response even if there's an error
    const errorTwimlResponse = generateErrorTwiML();

    return new NextResponse(errorTwimlResponse, {
      status: 200, // Always return 200 to Twilio to avoid retries
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}
