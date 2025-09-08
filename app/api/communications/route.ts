// Flynn.ai v2 - Communication API Routes
// S-tier API for communication management

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { communicationLogger } from '@/lib/communication/CommunicationLogger';

// GET /api/communications - Get communication logs with filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const communicationType = url.searchParams.get('type') as
      | 'email'
      | 'sms'
      | 'call'
      | null;
    const status = url.searchParams.get('status') as
      | 'pending'
      | 'sent'
      | 'delivered'
      | 'failed'
      | 'bounced'
      | null;
    const recipient = url.searchParams.get('recipient') || undefined;
    const eventId = url.searchParams.get('eventId') || undefined;
    const callId = url.searchParams.get('callId') || undefined;

    // Date range filters
    const dateFrom = url.searchParams.get('dateFrom')
      ? new Date(url.searchParams.get('dateFrom')!)
      : undefined;
    const dateTo = url.searchParams.get('dateTo')
      ? new Date(url.searchParams.get('dateTo')!)
      : undefined;

    const filters = {
      userId: user.id,
      ...(communicationType && { communicationType }),
      ...(status && { status }),
      ...(recipient && { recipient }),
      ...(eventId && { eventId }),
      ...(callId && { callId }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    };

    const result = await communicationLogger.getCommunicationLogs(
      filters,
      page,
      limit
    );

    return NextResponse.json({
      success: true,
      data: result.communications,
      pagination: {
        page,
        limit,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        hasNext: page < result.totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Communication API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch communications',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/communications - Create new communication (for manual sends)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, callId, communicationType, recipient, subject, content } =
      body;

    // Validate required fields
    if (!communicationType || !recipient || !content) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: communicationType, recipient, content',
        },
        { status: 400 }
      );
    }

    // Log the communication
    const result = await communicationLogger.logCommunication({
      user_id: user.id,
      event_id: eventId || null,
      call_id: callId || null,
      communication_type: communicationType,
      recipient,
      subject: subject || null,
      content,
      status: 'pending',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // TODO: Add actual sending logic here (SMS/Email services)
    // For now, we'll mark as sent immediately
    await communicationLogger.updateCommunicationStatus(result.id!, {
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: { id: result.id },
      message: 'Communication sent successfully',
    });
  } catch (error) {
    console.error('Communication POST error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send communication',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
