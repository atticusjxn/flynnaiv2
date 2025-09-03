import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { Database } from '@/types/database.types';

const MetricsQuerySchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  granularity: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  metrics: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());

    // Parse metrics parameter if it exists
    if (params.metrics) {
      try {
        params.metrics = JSON.parse(params.metrics);
      } catch {
        params.metrics = params.metrics.split(',');
      }
    }

    const validatedParams = MetricsQuerySchema.parse(params);

    // Default date range (last 30 days)
    const endDate =
      validatedParams.end_date || new Date().toISOString().split('T')[0];
    const startDate =
      validatedParams.start_date ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

    // Fetch business metrics
    const { data: businessMetrics, error: businessError } = await supabase
      .from('business_metrics')
      .select('*')
      .gte('metric_date', startDate)
      .lte('metric_date', endDate)
      .order('metric_date', { ascending: true });

    if (businessError) {
      console.error('Error fetching business metrics:', businessError);
      return NextResponse.json(
        { error: 'Failed to fetch business metrics' },
        { status: 500 }
      );
    }

    // Fetch user-specific metrics if available
    const { data: userMetrics, error: userError } = await supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', user.id)
      .gte('metric_date', startDate)
      .lte('metric_date', endDate)
      .order('metric_date', { ascending: true });

    if (userError) {
      console.error('Error fetching user metrics:', userError);
      // Don't fail the request, just return empty user metrics
    }

    // Calculate summary statistics
    const latestBusiness = businessMetrics[businessMetrics.length - 1];
    const latestUser = userMetrics?.[userMetrics.length - 1];

    const summary = {
      totalActiveUsers: latestBusiness?.total_active_users || 0,
      monthlyRecurringRevenue: latestBusiness?.monthly_recurring_revenue || 0,
      churnRate: latestBusiness?.churn_rate || 0,
      aiAccuracyRate: latestBusiness?.ai_accuracy_rate || 0,
      averageCallProcessingTime:
        latestBusiness?.average_call_processing_time || 0,
      userCallsProcessed: latestUser?.total_calls_processed || 0,
      userEventsExtracted: latestUser?.total_events_extracted || 0,
      userAiAccuracy: latestUser?.ai_accuracy_score || 0,
    };

    return NextResponse.json({
      summary,
      businessMetrics,
      userMetrics: userMetrics || [],
      dateRange: { startDate, endDate },
      granularity: validatedParams.granularity,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Analytics metrics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
