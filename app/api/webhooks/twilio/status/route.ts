import { NextRequest, NextResponse } from 'next/server';
import { updateCallStatus } from '@/lib/supabase/calls';
import { handleCallEndProcessing } from '@/lib/ai/CallProcessingManager';

export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio status webhook
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const direction = formData.get('Direction') as string;
    const duration = formData.get('CallDuration') as string;

    console.log('Call status webhook received:', {
      callSid,
      callStatus,
      direction,
      duration,
    });

    if (!callSid) {
      return NextResponse.json({ error: 'Missing CallSid' }, { status: 400 });
    }

    // Update call status in database
    await updateCallStatus(callSid, callStatus);

    // Handle call completion for processing cleanup
    if (
      ['completed', 'busy', 'failed', 'no-answer', 'cancelled'].includes(
        callStatus
      )
    ) {
      console.log(`Call ended with status: ${callStatus} for call: ${callSid}`);

      // Trigger silent processing completion
      await handleCallEndProcessing(callSid);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Call status webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
