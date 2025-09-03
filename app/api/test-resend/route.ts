import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'RESEND_API_KEY not found in environment variables',
        },
        { status: 500 }
      );
    }

    console.log('Testing Resend API connection...');
    console.log('API Key present:', !!apiKey);
    console.log('API Key prefix:', apiKey.substring(0, 10) + '...');

    const resend = new Resend(apiKey);

    // Test basic connection
    const testResult = await resend.emails.send({
      from: 'test@resend.dev', // Use Resend's test domain
      to: ['atticusjxn@gmail.com'],
      subject: 'Flynn.ai - Resend API Test',
      html: '<p>This is a test email from Flynn.ai to verify Resend integration.</p><p>If you receive this, the API is working correctly.</p>',
    });

    console.log('Resend API response:', testResult);

    return NextResponse.json({
      message: 'Resend API test completed',
      api_key_configured: !!apiKey,
      test_result: testResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Resend API test error:', error);
    return NextResponse.json(
      {
        error: 'Resend API test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        api_key_configured: !!process.env.RESEND_API_KEY,
      },
      { status: 500 }
    );
  }
}
