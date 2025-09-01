// Flynn.ai v2 - AI Processing Settings Stats API Route
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { validateUserId } from '@/lib/validation/schemas';
import { createErrorResponse, Logger } from '@/lib/utils/errorHandling';
import { withRateLimit, rateLimiters } from '@/lib/utils/rateLimiting';

export async function GET(request: NextRequest) {
  return withRateLimit(rateLimiters.userSettings)(request, async (req) => {
    const logger = new Logger('AIProcessingStatsAPI');
    
    try {
      const supabase = createClient();
      
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Validate user ID
      const validatedUserId = validateUserId(user.id);

      logger.info('Fetching AI processing stats', { userId: validatedUserId });

      // Get call processing stats for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: stats } = await supabase
        .from('calls')
        .select('business_call, events_extracted, processing_status, created_at')
        .eq('user_id', validatedUserId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      const totalCalls = stats?.length || 0;
      const businessCalls = stats?.filter(call => call.business_call).length || 0;
      const personalCalls = totalCalls - businessCalls;
      const eventsExtracted = stats?.reduce((sum, call) => sum + (call.events_extracted || 0), 0) || 0;
      const processingSuccessRate = stats?.filter(call => call.processing_status === 'completed').length || 0;

      return NextResponse.json({
        success: true,
        stats: {
          totalCallsLast30Days: totalCalls,
          businessCalls,
          personalCalls,
          eventsExtracted,
          processingSuccessRate: totalCalls > 0 ? (processingSuccessRate / totalCalls) * 100 : 0,
          averageEventsPerCall: businessCalls > 0 ? eventsExtracted / businessCalls : 0
        }
      });

    } catch (error) {
      logger.error('AI stats error', error instanceof Error ? error : new Error(String(error)));
      return createErrorResponse(error);
    }
  });
}