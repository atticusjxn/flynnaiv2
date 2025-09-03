import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const FeatureUsageQuerySchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  feature: z.string().optional(),
  user_id: z.string().optional(),
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
    const validatedParams = FeatureUsageQuerySchema.parse(params);

    // Default date range (last 30 days)
    const endDate =
      validatedParams.end_date || new Date().toISOString().split('T')[0];
    const startDate =
      validatedParams.start_date ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

    // Build base query for feature usage events
    let query = supabase
      .from('analytics_events')
      .select(
        `
        event_name,
        properties,
        created_at,
        user_id,
        users!inner(industry_type, subscription_tier)
      `
      )
      .eq('event_type', 'feature_usage')
      .gte('created_at', startDate + 'T00:00:00.000Z')
      .lte('created_at', endDate + 'T23:59:59.999Z');

    if (validatedParams.feature) {
      query = query.eq('event_name', validatedParams.feature);
    }

    if (validatedParams.user_id) {
      query = query.eq('user_id', validatedParams.user_id);
    }

    const { data: featureEvents, error: eventsError } = await query.order(
      'created_at',
      { ascending: false }
    );

    if (eventsError) {
      console.error('Error fetching feature usage events:', eventsError);
      return NextResponse.json(
        { error: 'Failed to fetch feature usage data' },
        { status: 500 }
      );
    }

    // Process feature usage data
    const featureStats =
      featureEvents?.reduce(
        (acc, event) => {
          const feature = event.event_name;
          if (!acc[feature]) {
            acc[feature] = {
              totalUsage: 0,
              uniqueUsers: new Set(),
              byIndustry: {},
              byTier: {},
              dailyUsage: {},
            };
          }

          acc[feature].totalUsage++;
          acc[feature].uniqueUsers.add(event.user_id);

          const industry = event.users?.industry_type || 'unknown';
          const tier = event.users?.subscription_tier || 'unknown';
          const date = event.created_at.split('T')[0];

          acc[feature].byIndustry[industry] =
            (acc[feature].byIndustry[industry] || 0) + 1;
          acc[feature].byTier[tier] = (acc[feature].byTier[tier] || 0) + 1;
          acc[feature].dailyUsage[date] =
            (acc[feature].dailyUsage[date] || 0) + 1;

          return acc;
        },
        {} as Record<string, any>
      ) || {};

    // Convert Sets to counts and format data
    const processedStats = Object.entries(featureStats).map(
      ([feature, stats]) => ({
        feature,
        totalUsage: stats.totalUsage,
        uniqueUsers: stats.uniqueUsers.size,
        adoptionRate:
          (stats.uniqueUsers.size / (featureEvents?.length || 1)) * 100,
        byIndustry: stats.byIndustry,
        byTier: stats.byTier,
        dailyUsage: stats.dailyUsage,
      })
    );

    // Calculate feature adoption heat map
    const adoptionHeatMap = processedStats.reduce(
      (acc, stat) => {
        acc[stat.feature] = {
          intensity: Math.min(stat.totalUsage / 100, 1), // Normalize to 0-1 scale
          users: stat.uniqueUsers,
          usage: stat.totalUsage,
        };
        return acc;
      },
      {} as Record<string, any>
    );

    // Get top features by usage
    const topFeatures = processedStats
      .sort((a, b) => b.totalUsage - a.totalUsage)
      .slice(0, 10);

    // Calculate feature usage trends
    const usageTrends = processedStats.reduce(
      (acc, stat) => {
        const dates = Object.keys(stat.dailyUsage).sort();
        acc[stat.feature] = dates.map((date) => ({
          date,
          usage: stat.dailyUsage[date],
        }));
        return acc;
      },
      {} as Record<string, any>
    );

    // Get user-specific usage if requested
    let userUsage = null;
    if (validatedParams.user_id === user.id) {
      const userEvents =
        featureEvents?.filter((event) => event.user_id === user.id) || [];
      userUsage = {
        totalFeatureUsage: userEvents.length,
        featuresUsed: [...new Set(userEvents.map((e) => e.event_name))].length,
        mostUsedFeatures: userEvents.reduce(
          (acc, event) => {
            acc[event.event_name] = (acc[event.event_name] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        lastUsedFeature: userEvents[0]?.event_name,
        lastUsedAt: userEvents[0]?.created_at,
      };
    }

    return NextResponse.json({
      summary: {
        totalFeatureUsage: featureEvents?.length || 0,
        uniqueFeatures: Object.keys(featureStats).length,
        topFeature: topFeatures[0]?.feature,
        averageUsagePerUser: featureEvents?.length
          ? featureEvents.length /
            new Set(featureEvents.map((e) => e.user_id)).size
          : 0,
      },
      topFeatures,
      adoptionHeatMap,
      usageTrends,
      featureBreakdown: processedStats,
      userUsage,
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Feature usage analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
