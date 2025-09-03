import { NextRequest, NextResponse } from 'next/server';
import { handleKeypadActivation } from '@/lib/ai/KeypadActivation';
import { generateKeypadActivationTwiML } from '@/lib/twilio/twiml';
import { handleCallActivation } from '@/lib/ai/CallProcessingManager';

export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio DTMF webhook
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const digits = formData.get('Digits') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;

    console.log('DTMF webhook received:', {
      callSid,
      digits,
      from,
      to,
    });

    if (!callSid) {
      return NextResponse.json({ error: 'Missing CallSid' }, { status: 400 });
    }

    // Process keypad input for potential AI activation
    const activationResult = await handleKeypadActivation(
      callSid,
      digits,
      from,
      to
    );

    console.log(
      `Keypad activation result for call ${callSid}:`,
      activationResult
    );

    // If AI was activated, notify the CallProcessingManager
    if (activationResult.activated) {
      await handleCallActivation(callSid);
    }

    // Return silent TwiML response (no indication to caller regardless of activation)
    const twimlResponse = generateKeypadActivationTwiML();

    return new NextResponse(twimlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('DTMF webhook error:', error);

    // Return empty TwiML to continue call normally even if there's an error
    const errorTwiML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <!-- Continue call normally -->
</Response>`;

    return new NextResponse(errorTwiML, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}
