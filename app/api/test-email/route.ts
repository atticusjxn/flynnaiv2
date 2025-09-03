import { NextRequest, NextResponse } from 'next/server';
import {
  InstantEmailService,
  EmailDeliveryRequest,
} from '@/lib/email/InstantEmailService';

const emailService = InstantEmailService.getInstance();

export async function GET() {
  try {
    const queueStatus = emailService.getQueueStatus();

    return NextResponse.json({
      message: 'Email System Status',
      timestamp: new Date().toISOString(),
      queue_status: queueStatus,
      endpoints: {
        test_send: '/api/test-email (POST)',
        queue_status: '/api/test-email (GET)',
      },
    });
  } catch (error) {
    console.error('Email system test error:', error);
    return NextResponse.json(
      {
        error: 'Email system test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'test-send') {
      // Test email with sample extracted events
      const testEmailRequest: EmailDeliveryRequest = {
        callSid: `test-call-${Date.now()}`,
        userId: '00000000-0000-0000-0000-000000000123',
        userEmail: 'atticusjxn@gmail.com',
        companyName: 'Flynn.ai Test Company',
        industry: 'plumbing',
        callerPhone: '+15551234567',
        callDuration: 145,
        transcriptionText:
          "Hi, this is John calling about getting my kitchen sink fixed. I have a leak under the sink that's getting worse. Could someone come out tomorrow afternoon around 2 PM? My address is 123 Main Street. My phone number is 555-1234. It's not an emergency but I'd like to get it fixed soon.",
        extractedEvents: [
          {
            id: 'event_test_1',
            type: 'service_call',
            title: 'Kitchen Sink Leak Repair',
            description: 'Repair leak under kitchen sink that is getting worse',
            proposed_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0], // Tomorrow
            proposed_time: '14:00',
            duration_minutes: 90,
            urgency: 'medium',
            customer_name: 'John',
            customer_phone: '555-1234',
            service_address: '123 Main Street',
            service_type: 'Plumbing Repair',
            price_range: '$150-250',
            confidence_score: 0.95,
            extraction_notes:
              'Clear service request with specific time, location, and contact info',
          },
        ],
      };

      console.log('Testing email delivery with sample data');

      // Queue the email (this starts immediate processing)
      await emailService.queueEmailDelivery(testEmailRequest);

      return NextResponse.json({
        message: 'Test email queued for delivery',
        call_sid: testEmailRequest.callSid,
        recipient: testEmailRequest.userEmail,
        events_count: testEmailRequest.extractedEvents.length,
        expected_delivery: '< 2 minutes',
      });
    }

    return NextResponse.json(
      { error: 'Unknown action. Use: test-send' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json(
      {
        error: 'Email test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
