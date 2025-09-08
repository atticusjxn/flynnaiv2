// Flynn.ai v2 - Call Forwarding Webhook Handler
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string; // This is the Flynn.ai forwarding number
    const callStatus = formData.get('CallStatus') as string;

    const supabase = createClient();

    // Find the user who owns this forwarding number
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('forwarding_number', to)
      .single();

    if (userError || !userData) {
      console.error('No user found for forwarding number:', to);
      return new NextResponse(generateErrorResponse().toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Create call record
    await supabase.from('calls').insert({
      user_id: userData.id,
      call_sid: callSid,
      caller_number: from,
      called_number: to,
      forwarded_to: userData.user_phone_number,
      call_status: callStatus,
      ai_processing_enabled: userData.ai_processing_enabled,
      created_at: new Date().toISOString(),
    });

    // Generate TwiML response to forward the call
    const twiml = new VoiceResponse();

    if (userData.ai_processing_enabled && userData.user_phone_number) {
      // Set up call forwarding with recording for AI processing
      const dial = twiml.dial({
        callerId: from, // Preserve caller ID
        record: 'record-from-answer', // Record the entire call for AI processing
        recordingStatusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/recording-complete`,
        recordingStatusCallbackMethod: 'POST',
        timeout: 20, // Ring for 20 seconds
      });

      dial.number(
        {
          statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/call-status`,
          statusCallbackMethod: 'POST',
          statusCallbackEvent: [
            'initiated',
            'ringing',
            'answered',
            'completed',
          ],
        },
        userData.user_phone_number
      );

      // If the user doesn't answer, go to voicemail
      twiml.say(
        {
          voice: 'Polly.Amy', // Australian English voice
        },
        "I'm sorry, but there's no answer. Please leave a message after the tone, and we'll get back to you shortly."
      );

      twiml.record({
        recordingStatusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/voicemail-complete`,
        recordingStatusCallbackMethod: 'POST',
        timeout: 30,
        maxLength: 300, // 5 minutes max
        playBeep: true,
      });
    } else {
      // AI processing is disabled - just forward the call normally
      if (userData.user_phone_number) {
        const dial = twiml.dial({
          callerId: from,
          timeout: 20,
        });
        dial.number(userData.user_phone_number);
      } else {
        twiml.say(
          {
            voice: 'Polly.Amy',
          },
          "I'm sorry, but this number is not currently in service. Please try again later."
        );
      }
    }

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Call forwarding webhook error:', error);
    return new NextResponse(generateErrorResponse().toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}

function generateErrorResponse() {
  const twiml = new VoiceResponse();
  twiml.say(
    {
      voice: 'Polly.Amy',
    },
    "I'm sorry, but we're experiencing technical difficulties. Please try again later."
  );
  twiml.hangup();
  return twiml;
}

// Handle call status updates
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const callDuration = formData.get('CallDuration') as string;

    const supabase = createClient();

    // Update call status
    await supabase
      .from('calls')
      .update({
        call_status: callStatus,
        call_duration: callDuration ? parseInt(callDuration) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('call_sid', callSid);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Call status update error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
