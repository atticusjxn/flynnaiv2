// Flynn.ai v2 - AI Processing Settings Stats API Route (Simplified)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Force dynamic rendering - this route uses cookies
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get call processing stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // For now, return mock data since the calls table might not exist yet
    const stats = {
      totalCallsLast30Days: 24,
      businessCalls: 18,
      personalCalls: 6,
      eventsExtracted: 15,
      processingSuccessRate: 85.2,
      averageEventsPerCall: 0.83,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('AI stats error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
      },
      { status: 500 }
    );
  }
}
