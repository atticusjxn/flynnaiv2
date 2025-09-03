import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Twilio Webhook Test Endpoint',
    timestamp: new Date().toISOString(),
    status: 'active',
  });
}

export async function POST(request: NextRequest) {
  try {
    // Parse form data as Twilio sends
    const formData = await request.formData();

    const data: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value.toString();
    }

    console.log('Test webhook received:', data);

    return NextResponse.json({
      message: 'Test webhook processed successfully',
      receivedData: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Test webhook failed', details: String(error) },
      { status: 500 }
    );
  }
}
