import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance/monitoring';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const timeRange = url.searchParams.get('timeRange');
    const timeRangeMs = timeRange ? parseInt(timeRange) * 1000 : 3600000; // Default: 1 hour

    // Validate time range (max 24 hours)
    if (timeRangeMs > 24 * 60 * 60 * 1000) {
      return NextResponse.json(
        { error: 'Time range cannot exceed 24 hours' },
        { status: 400 }
      );
    }

    const analytics = performanceMonitor.getAnalytics(timeRangeMs);
    const health = await performanceMonitor.getSystemHealth();

    const response = {
      timeRange: timeRangeMs,
      timeRangeHours: timeRangeMs / (1000 * 60 * 60),
      analytics,
      systemHealth: health,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Performance analytics error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Analytics generation failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Performance metrics summary endpoint
export async function POST(request: NextRequest) {
  try {
    // Custom metrics reporting endpoint for client-side performance data
    const body = await request.json();
    const { metrics, userAgent, userId } = body;

    // Validate required fields
    if (!metrics || typeof metrics !== 'object') {
      return NextResponse.json(
        { error: 'Invalid metrics data' },
        { status: 400 }
      );
    }

    // Store client-side performance metrics
    // In production, this would be sent to your monitoring service
    console.log('Client Performance Metrics:', {
      timestamp: new Date().toISOString(),
      userAgent,
      userId,
      metrics: {
        pageLoadTime: metrics.pageLoadTime,
        firstContentfulPaint: metrics.firstContentfulPaint,
        largestContentfulPaint: metrics.largestContentfulPaint,
        cumulativeLayoutShift: metrics.cumulativeLayoutShift,
        firstInputDelay: metrics.firstInputDelay,
        route: metrics.route,
      },
    });

    return NextResponse.json({
      status: 'recorded',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Client metrics recording error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Metrics recording failed',
      },
      { status: 500 }
    );
  }
}
