import { NextRequest, NextResponse } from 'next/server';
import { reactEmailService } from '@/lib/email/ReactEmailService';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'React Email Service Test',
      timestamp: new Date().toISOString(),
      service_status: 'operational',
      endpoints: {
        preview: '/api/email/test (POST) - Preview email template',
        send: '/api/email/test (POST) - Send test email',
      },
      queue_status: reactEmailService.getQueueStatus(),
    });
  } catch (error) {
    console.error('React email test error:', error);
    return NextResponse.json(
      {
        error: 'React email test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...requestData } = await request.json();

    // Default test data
    const defaultTestRequest = {
      callSid: `test-call-${Date.now()}`,
      userId: '00000000-0000-0000-0000-000000000123',
      userEmail: 'test@example.com',
      companyName: 'Test Plumbing Co.',
      industry: 'plumbing',
      callSummary: {
        callerPhone: '+61455123456',
        callerName: 'John Smith',
        duration: 180,
        timestamp: new Date().toISOString(),
        callSid: `test-call-${Date.now()}`,
      },
      extractedEvents: [
        {
          id: 'event-1',
          title: 'Emergency Pipe Repair - Kitchen Sink',
          description:
            'Customer reports burst pipe under kitchen sink causing flooding. Needs immediate attention to prevent water damage.',
          type: 'emergency',
          proposed_datetime: new Date(
            Date.now() + 2 * 60 * 60 * 1000
          ).toISOString(), // 2 hours from now
          duration_minutes: 120,
          urgency: 'emergency' as const,
          customer_name: 'John Smith',
          customer_phone: '+61455123456',
          customer_email: 'john.smith@example.com',
          location: '123 Main Street, Melbourne VIC 3000',
          service_address: '123 Main Street, Melbourne VIC 3000',
          service_type: 'Emergency Plumbing Repair',
          price_estimate: '$300-500',
          confidence_score: 0.95,
          status: 'extracted',
        },
        {
          id: 'event-2',
          title: 'Follow-up Service - Pipe Inspection',
          description:
            'Schedule follow-up inspection to check repair quality and identify any other potential issues.',
          type: 'service_call',
          proposed_datetime: new Date(
            Date.now() + 24 * 60 * 60 * 1000
          ).toISOString(), // tomorrow
          duration_minutes: 60,
          urgency: 'medium' as const,
          customer_name: 'John Smith',
          customer_phone: '+61455123456',
          customer_email: 'john.smith@example.com',
          location: '123 Main Street, Melbourne VIC 3000',
          service_address: '123 Main Street, Melbourne VIC 3000',
          service_type: 'Plumbing Inspection',
          price_estimate: '$150',
          confidence_score: 0.85,
          status: 'extracted',
        },
      ],
      transcriptionText:
        'Hi, this is John Smith calling about an emergency. I have a pipe that just burst under my kitchen sink and water is everywhere. I need someone out here as soon as possible to fix this before it causes any more damage. My address is 123 Main Street in Melbourne. I think we might also need a follow-up inspection after the repair.',
      emergencyContact: '+61455999888',
      afterHoursAvailable: true,
    };

    // Merge with provided data
    const testRequest = { ...defaultTestRequest, ...requestData };

    if (action === 'preview') {
      console.log('Generating React email preview...');

      const emailHtml = await reactEmailService.previewEmail(testRequest);

      return NextResponse.json({
        message: 'React email preview generated',
        html: emailHtml,
        test_data: testRequest,
      });
    }

    if (action === 'send') {
      if (!testRequest.userEmail || !testRequest.userEmail.includes('@')) {
        return NextResponse.json(
          { error: 'Valid email address is required for sending test' },
          { status: 400 }
        );
      }

      console.log('Sending test React email to:', testRequest.userEmail);

      await reactEmailService.queueEmailDelivery(testRequest);

      return NextResponse.json({
        message: 'Test React email queued for delivery',
        recipient: testRequest.userEmail,
        call_sid: testRequest.callSid,
        queue_status: reactEmailService.getQueueStatus(),
      });
    }

    if (action === 'status') {
      const queueStatus = reactEmailService.getQueueStatus();

      return NextResponse.json({
        message: 'React email service status',
        queue_status: queueStatus,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'force-delivery') {
      const { call_sid } = requestData;
      if (!call_sid) {
        return NextResponse.json(
          { error: 'call_sid is required for force delivery' },
          { status: 400 }
        );
      }

      console.log('Forcing delivery for call:', call_sid);

      const result = await reactEmailService.forceDelivery(call_sid);

      if (!result) {
        return NextResponse.json(
          { error: 'Call not found in delivery queue' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: 'Forced delivery completed',
        delivery_result: result,
      });
    }

    return NextResponse.json(
      { error: 'Unknown action. Use: preview, send, status, force-delivery' },
      { status: 400 }
    );
  } catch (error) {
    console.error('React email test error:', error);
    return NextResponse.json(
      {
        error: 'React email test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
