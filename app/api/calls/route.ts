import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DatabaseOptimizer } from '@/lib/performance/database-optimization';
import { withPerformanceMonitoring } from '@/lib/performance/monitoring';

async function getCallsHandler(request: NextRequest) {
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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '20'),
      100
    ); // Max 100

    // Parse filters
    const filters = {
      status: url.searchParams.get('status')?.split(',').filter(Boolean),
      urgency: url.searchParams.get('urgency')?.split(',').filter(Boolean),
      aiStatus: url.searchParams.get('aiStatus')?.split(',').filter(Boolean),
      search: url.searchParams.get('search') || undefined,
      dateRange:
        url.searchParams.get('startDate') && url.searchParams.get('endDate')
          ? {
              start: new Date(url.searchParams.get('startDate')!),
              end: new Date(url.searchParams.get('endDate')!),
            }
          : undefined,
    };

    // Use optimized database queries
    const optimizer = new DatabaseOptimizer();
    const result = await optimizer.getOptimizedCalls(
      user.id,
      page,
      limit,
      filters
    );

    // Get statistics if requested
    const includeStats = url.searchParams.get('includeStats') === 'true';
    let statistics;

    if (includeStats) {
      statistics = await optimizer.getCallStatistics(
        user.id,
        filters.dateRange
      );
    }

    const response = {
      calls: result.data,
      pagination: {
        currentPage: result.currentPage,
        totalCount: result.totalCount,
        hasMore: result.hasMore,
        pageSize: limit,
      },
      ...(statistics && { statistics }),
      generatedAt: new Date().toISOString(),
    };

    // Set cache headers for better performance
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
        ETag: `"calls-${user.id}-${page}-${JSON.stringify(filters).slice(0, 50)}"`,
      },
    });
  } catch (error) {
    console.error('Calls API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch calls',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Bulk operations endpoint
async function postCallsHandler(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, callIds } = body;

    if (!action || !callIds || !Array.isArray(callIds)) {
      return NextResponse.json(
        { error: 'Invalid request body. Required: action, callIds' },
        { status: 400 }
      );
    }

    if (callIds.length > 100) {
      return NextResponse.json(
        { error: 'Cannot process more than 100 calls at once' },
        { status: 400 }
      );
    }

    const optimizer = new DatabaseOptimizer();
    let result;

    switch (action) {
      case 'updateStatus':
        const { status } = body;
        if (!status) {
          return NextResponse.json(
            { error: 'Status is required for updateStatus action' },
            { status: 400 }
          );
        }
        result = await optimizer.bulkUpdateCallStatus(callIds, status, user.id);
        break;

      case 'delete':
        // Soft delete calls (set deleted_at timestamp)
        const { data: deleteData, error: deleteError } = await supabase
          .from('calls')
          .update({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .in('id', callIds)
          .eq('user_id', user.id)
          .select('id');

        if (deleteError) throw deleteError;
        result = deleteData;
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      affectedCalls: result?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Bulk calls operation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Bulk operation failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Export with performance monitoring
export const GET = withPerformanceMonitoring(getCallsHandler);
export const POST = withPerformanceMonitoring(postCallsHandler);
