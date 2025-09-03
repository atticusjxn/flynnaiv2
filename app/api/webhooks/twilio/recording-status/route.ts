import { NextRequest, NextResponse } from 'next/server';
import { updateCallStatus } from '@/lib/supabase/calls';

export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio webhook
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const recordingStatus = formData.get('RecordingStatus') as string;
    const recordingSid = formData.get('RecordingSid') as string;

    console.log('Recording status webhook received:', {
      callSid,
      recordingSid,
      recordingStatus,
    });

    if (!callSid) {
      return NextResponse.json({ error: 'Missing CallSid' }, { status: 400 });
    }

    // Update call status based on recording status
    let callStatus = 'in_progress';

    switch (recordingStatus) {
      case 'completed':
        callStatus = 'recorded';
        // TODO: This is where we would trigger the AI processing pipeline
        console.log(
          'Recording completed, triggering AI processing for call:',
          callSid
        );
        break;
      case 'failed':
        callStatus = 'recording_failed';
        console.error('Recording failed for call:', callSid);
        break;
      case 'in-progress':
        callStatus = 'recording';
        break;
    }

    await updateCallStatus(callSid, callStatus);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Recording status webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
