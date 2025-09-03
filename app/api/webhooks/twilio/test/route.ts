import { NextRequest, NextResponse } from 'next/server';
import { generateCallHandlingTwiML } from '@/lib/twilio/twiml';

// Test endpoint for Twilio webhook functionality
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Log all incoming data for debugging
    const webhookData = Object.fromEntries(formData.entries());
    console.log('Twilio webhook test data:', webhookData);

    // Generate a simple TwiML response for testing
    const twimlResponse = generateCallHandlingTwiML(
      {
        message:
          'This is a test response from Flynn.ai. Your webhook integration is working correctly.',
        voice: 'alice',
      },
      {
        maxLength: 30, // 30 seconds for testing
        transcribe: false,
        playBeep: false,
      }
    );

    return new NextResponse(twimlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Twilio webhook test error:', error);

    return NextResponse.json(
      {
        error: 'Test webhook error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
      }
    );
  }
}

// GET endpoint for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Twilio webhook test endpoint is active',
    endpoints: {
      voice: '/api/webhooks/twilio/voice',
      recording: '/api/webhooks/twilio/recording',
      recordingStatus: '/api/webhooks/twilio/recording-status',
      test: '/api/webhooks/twilio/test',
    },
    timestamp: new Date().toISOString(),
  });
}
