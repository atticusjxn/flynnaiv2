import { NextRequest, NextResponse } from 'next/server';
import { processPendingDeletions } from '@/lib/compliance/DataRetention';

/**
 * Data Retention Cleanup API - Run via cron job
 * POST /api/admin/data-retention
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is called from a trusted source (cron job, admin)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.ADMIN_API_TOKEN;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting scheduled data retention cleanup...');

    // Process all pending deletion jobs
    const results = await processPendingDeletions();

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        processed: results.processed,
        successful: results.successful,
        failed: results.failed,
        errors: results.errors
      },
      message: `Processed ${results.processed} deletion jobs: ${results.successful} successful, ${results.failed} failed`
    };

    console.log('Data retention cleanup completed:', response.message);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Data retention cleanup error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get data retention status
 * GET /api/admin/data-retention
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.ADMIN_API_TOKEN;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return current data retention status
    const status = {
      timestamp: new Date().toISOString(),
      policies: {
        call_recordings: '90 days (30 days for medical)',
        transcriptions: '90 days (30 days for medical)', 
        ai_extractions: '365 days (90 days for medical)',
        personal_data: '90 days',
        compliance_logs: '7 years (archived)'
      },
      compliance: {
        gdpr_enabled: true,
        ccpa_enabled: true,
        hipaa_enabled: true,
        automated_deletion: true
      },
      next_cleanup: 'Runs daily at midnight UTC',
      last_run: 'Not implemented - would track last execution'
    };

    return NextResponse.json(status);

  } catch (error) {
    console.error('Error fetching data retention status:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}