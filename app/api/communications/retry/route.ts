// Flynn.ai v2 - Communication Retry API
// S-tier retry mechanism for failed communications

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { communicationLogger } from '@/lib/communication/CommunicationLogger';

// POST /api/communications/retry - Retry a failed communication
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
    const { communicationId } = body;

    if (!communicationId) {
      return NextResponse.json(
        { error: 'Missing required field: communicationId' },
        { status: 400 }
      );
    }

    // Verify the communication belongs to the user
    const { data: communication, error: fetchError } = await supabase
      .from('communication_logs')
      .select('*')
      .eq('id', communicationId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !communication) {
      return NextResponse.json(
        { error: 'Communication not found or access denied' },
        { status: 404 }
      );
    }

    // Only allow retry for failed communications
    if (communication.status !== 'failed') {
      return NextResponse.json(
        { error: 'Only failed communications can be retried' },
        { status: 400 }
      );
    }

    // Retry the communication
    const result =
      await communicationLogger.retryCommunication(communicationId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { newCommunicationId: result.id },
      message: 'Communication retry initiated successfully',
    });
  } catch (error) {
    console.error('Communication retry error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retry communication',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
