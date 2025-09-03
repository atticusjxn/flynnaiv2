import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const RevenueQuerySchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  granularity: z.enum(['daily', 'weekly', 'monthly']).default('monthly'),
  breakdown: z.enum(['total', 'by_tier', 'by_industry', 'cohort']).default('total'),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user (admin only for revenue data)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const validatedParams = RevenueQuerySchema.parse(params);

    // Default date range (last 12 months)
    const endDate = validatedParams.end_date || new Date().toISOString().split('T')[0];
    const startDate = validatedParams.start_date || 
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Calculate Customer Lifetime Value (CLV)
    const clvQuery = `
      WITH user_revenue AS (
        SELECT 
          u.id,
          u.industry_type,
          u.subscription_tier,
          u.created_at,
          COALESCE(SUM(um.subscription_mrr), 0) as total_revenue,
          COALESCE(AVG(um.churn_risk_score), 0) as avg_churn_risk,
          COUNT(um.metric_date) as months_active
        FROM users u
        LEFT JOIN user_metrics um ON u.id = um.user_id
        WHERE um.metric_date >= $1 AND um.metric_date <= $2
        GROUP BY u.id, u.industry_type, u.subscription_tier, u.created_at
      ),
      clv_calculation AS (
        SELECT 
          industry_type,
          subscription_tier,
          AVG(total_revenue) as avg_revenue_per_user,
          AVG(months_active) as avg_lifetime_months,
          AVG(avg_churn_risk) as avg_churn_risk,
          AVG(total_revenue / NULLIF(months_active, 0)) as avg_monthly_value,
          COUNT(*) as user_count
        FROM user_revenue
        WHERE months_active > 0
        GROUP BY industry_type, subscription_tier
      )
      SELECT 
        industry_type,
        subscription_tier,
        avg_revenue_per_user,
        avg_lifetime_months,
        avg_churn_risk,
        avg_monthly_value,
        user_count,
        CASE 
          WHEN avg_churn_risk > 0 
          THEN (avg_monthly_value * avg_lifetime_months) / (1 + avg_churn_risk)
          ELSE avg_monthly_value * avg_lifetime_months
        END as estimated_clv
      FROM clv_calculation
      ORDER BY estimated_clv DESC
    `;

    const { data: clvData, error: clvError } = await supabase.rpc('execute_sql', {
      sql: clvQuery,
      params: [startDate, endDate]
    });

    // Fetch MRR trend data
    const { data: mrrData, error: mrrError } = await supabase
      .from('business_metrics')
      .select(`
        metric_date,
        monthly_recurring_revenue,
        new_signups,
        churn_rate,
        total_active_users
      `)
      .gte('metric_date', startDate)
      .lte('metric_date', endDate)
      .order('metric_date', { ascending: true });

    if (mrrError) {
      console.error('Error fetching MRR data:', mrrError);
      return NextResponse.json(
        { error: 'Failed to fetch revenue data' },
        { status: 500 }
      );
    }

    // Calculate revenue by subscription tier
    const { data: tierRevenue, error: tierError } = await supabase
      .from('users')
      .select(`
        subscription_tier,
        user_metrics!inner(subscription_mrr, metric_date)
      `)
      .gte('user_metrics.metric_date', startDate)
      .lte('user_metrics.metric_date', endDate);

    // Process tier revenue data
    const revenueByTier = tierRevenue?.reduce((acc, user) => {
      const tier = user.subscription_tier || 'trial';
      if (!acc[tier]) acc[tier] = 0;
      acc[tier] += user.user_metrics.reduce((sum, metric) => sum + (metric.subscription_mrr || 0), 0);
      return acc;
    }, {} as Record<string, number>) || {};

    // Calculate key metrics
    const latestMetrics = mrrData?.[mrrData.length - 1];
    const previousMetrics = mrrData?.[mrrData.length - 2];
    
    const mrrGrowth = latestMetrics && previousMetrics 
      ? ((latestMetrics.monthly_recurring_revenue - previousMetrics.monthly_recurring_revenue) / previousMetrics.monthly_recurring_revenue) * 100
      : 0;

    const averageRevenuePerUser = latestMetrics?.total_active_users 
      ? latestMetrics.monthly_recurring_revenue / latestMetrics.total_active_users
      : 0;

    return NextResponse.json({
      summary: {
        currentMRR: latestMetrics?.monthly_recurring_revenue || 0,
        mrrGrowthRate: mrrGrowth,
        averageRevenuePerUser,
        churnRate: latestMetrics?.churn_rate || 0,
        totalActiveUsers: latestMetrics?.total_active_users || 0,
      },
      mrrTrend: mrrData || [],
      revenueByTier,
      customerLifetimeValue: clvData || [],
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
    
    console.error('Revenue analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}