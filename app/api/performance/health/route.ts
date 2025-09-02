import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance/monitoring';

export async function GET(request: NextRequest) {
  try {
    const health = await performanceMonitor.getSystemHealth();
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 206 : 503;
    
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp: Date.now()
      },
      { status: 503 }
    );
  }
}

export async function HEAD(request: NextRequest) {
  // Simple health check endpoint for load balancers
  try {
    const health = await performanceMonitor.getSystemHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    return new NextResponse(null, { 
      status: statusCode,
      headers: {
        'X-Health-Status': health.status,
        'X-Response-Time': health.metrics.responseTime.toString(),
        'X-Error-Rate': health.metrics.errorRate.toString(),
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}