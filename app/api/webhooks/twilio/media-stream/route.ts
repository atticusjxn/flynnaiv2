import { NextRequest, NextResponse } from 'next/server';
import { processRealTimeAudio, startRealTimeProcessing, stopRealTimeProcessing } from '@/lib/ai/RealTimeProcessor';
import { updateCallProcessingStatus } from '@/lib/supabase/calls';
import { isAIProcessingActive } from '@/lib/ai/KeypadActivation';

// Handle WebSocket connections for Twilio Media Streams
export async function GET(request: NextRequest) {
  // Twilio Media Streams use WebSocket connections
  // This endpoint will be upgraded to WebSocket by Twilio
  return new NextResponse('WebSocket endpoint for Twilio Media Streams', { 
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    // Handle media stream events
    const data = await request.json();
    const { event, streamSid, callSid, media } = data;

    console.log('Media stream event:', { event, streamSid, callSid });

    switch (event) {
      case 'connected':
        console.log('Media stream connected for call:', callSid);
        await updateCallProcessingStatus(callSid, 'media_stream_connected');
        break;

      case 'start':
        console.log('Media stream started for call:', callSid);
        await updateCallProcessingStatus(callSid, 'media_stream_active');
        break;

      case 'media':
        // Only process audio if AI is activated for this call
        if (media && media.payload && isAIProcessingActive(callSid)) {
          await processRealTimeAudio(callSid, media.payload, media.timestamp);
        }
        break;

      case 'stop':
        console.log('Media stream stopped for call:', callSid);
        await updateCallProcessingStatus(callSid, 'media_stream_ended');
        break;

      default:
        console.log('Unknown media stream event:', event);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Media stream webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}