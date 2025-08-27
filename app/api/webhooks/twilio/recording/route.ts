import { NextRequest, NextResponse } from 'next/server';
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
    await updateCallWithRecording(callSid, {
      recording_url: recordingUrl,
      recording_sid: recordingSid,
      duration: recordingDuration ? parseInt(recordingDuration) : null,
      status: 'recorded'
    });

    // Trigger AI processing pipeline
    console.log('Call recording completed, starting AI processing:', callSid);
    
    // Import and trigger the AI extraction pipeline
    await import('@/lib/ai/AIExtractionPipeline').then(async (module) => {
      try {
        await module.processRecordedCall(callSid, recordingUrl);
      } catch (error) {
        console.error('Error in AI extraction pipeline:', error);
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Recording webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}