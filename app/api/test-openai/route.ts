import { NextRequest, NextResponse } from 'next/server';
import { testOpenAIConnection } from '@/lib/openai/client';
import { extractEventsFromTranscription } from '@/lib/openai/extraction';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing OpenAI connection...');
    const connectionTest = await testOpenAIConnection();
    
    return NextResponse.json({
      message: 'OpenAI Integration Test',
      timestamp: new Date().toISOString(),
      connection: connectionTest,
      endpoints: {
        transcription: '/api/test-openai/transcription',
        extraction: '/api/test-openai/extraction'
      }
    });

  } catch (error) {
    console.error('OpenAI test error:', error);
    return NextResponse.json(
      { 
        error: 'OpenAI test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    if (action === 'test-extraction') {
      const sampleTranscription = data?.transcription || `
        Hi, this is John calling about getting my kitchen sink fixed. 
        I have a leak under the sink that's getting worse. 
        Could someone come out tomorrow afternoon around 2 PM? 
        My address is 123 Main Street. My phone number is 555-1234.
        It's not an emergency but I'd like to get it fixed soon.
      `;

      console.log('Testing event extraction with sample transcription');
      const result = await extractEventsFromTranscription(
        sampleTranscription, 
        'plumbing',
        { from: '+15551234567', to: '+15559876543' }
      );

      return NextResponse.json({
        message: 'Event extraction test completed',
        sample_transcription: sampleTranscription,
        extraction_result: result
      });
    }

    return NextResponse.json(
      { error: 'Unknown action. Use: test-extraction' },
      { status: 400 }
    );

  } catch (error) {
    console.error('OpenAI extraction test error:', error);
    return NextResponse.json(
      { 
        error: 'OpenAI extraction test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}