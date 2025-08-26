import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/utils/supabase/server';
import { updateCallWithRecording } from '@/lib/supabase/calls';

export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio webhook
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;
    const recordingSid = formData.get('RecordingSid') as string;
    const recordingDuration = formData.get('RecordingDuration') as string;

    console.log('Recording webhook received:', {
      callSid,
      recordingSid,
      recordingUrl,
      recordingDuration
    });

    if (!callSid || !recordingUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update the call record with recording information
    const supabase = createServerClient();
    
    await updateCallWithRecording(callSid, {
      recording_url: recordingUrl,
      recording_sid: recordingSid,
      duration: recordingDuration ? parseInt(recordingDuration) : null,
      status: 'recorded'
    });

    // TODO: Trigger AI processing pipeline here
    // This will be implemented in the next task
    console.log('Call recording completed, ready for AI processing:', callSid);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Recording webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}