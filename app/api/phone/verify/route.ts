// Flynn.ai v2 - Phone Verification API Route
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, setupMethod, webhookUrl } = await request.json();

    if (!phoneNumber || !setupMethod) {
      return NextResponse.json(
        { error: 'Phone number and setup method are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let verificationResult;

    if (setupMethod === 'new') {
      // Purchase a new Twilio phone number
      verificationResult = await setupNewPhoneNumber(phoneNumber, webhookUrl);
    } else {
      // Verify existing phone number configuration
      verificationResult = await verifyExistingPhone(phoneNumber, webhookUrl);
    }

    if (verificationResult.success) {
      // Update user's phone configuration
      const { error: updateError } = await supabase
        .from('users')
        .update({
          phone_number: verificationResult.phoneNumber,
          twilio_phone_sid: verificationResult.phoneSid,
          twilio_webhook_configured: true,
          phone_setup_method: setupMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to update user phone config:', updateError);
        return NextResponse.json(
          { error: 'Failed to save phone configuration' },
          { status: 500 }
        );
      }

      // Log successful phone setup
      await supabase.from('user_events').insert({
        user_id: user.id,
        event_type: 'phone_verified',
        event_data: {
          phone_number: verificationResult.phoneNumber,
          setup_method: setupMethod,
        },
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(verificationResult);
  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json(
      { error: 'Phone verification failed' },
      { status: 500 }
    );
  }
}

async function setupNewPhoneNumber(areaCode: string, webhookUrl: string) {
  try {
    // Search for available phone numbers in the specified area code
    const availableNumbers = await client
      .availablePhoneNumbers('US')
      .local.list({
        areaCode: areaCode || undefined,
        limit: 1,
      });

    if (availableNumbers.length === 0) {
      return {
        success: false,
        error: 'No phone numbers available in the requested area code',
      };
    }

    const selectedNumber = availableNumbers[0];

    // Purchase the phone number
    const purchasedNumber = await client.incomingPhoneNumbers.create({
      phoneNumber: selectedNumber.phoneNumber,
      voiceUrl: webhookUrl,
      voiceMethod: 'POST',
      voiceFallbackUrl: `${webhookUrl}/fallback`,
      voiceFallbackMethod: 'POST',
      statusCallback: `${webhookUrl}/status`,
      statusCallbackMethod: 'POST',
    });

    return {
      success: true,
      phoneNumber: purchasedNumber.phoneNumber,
      phoneSid: purchasedNumber.sid,
      message: 'Phone number configured successfully',
    };
  } catch (error) {
    console.error('Failed to setup new phone number:', error);
    return {
      success: false,
      error: 'Failed to configure new phone number',
    };
  }
}

async function verifyExistingPhone(phoneNumber: string, webhookUrl: string) {
  try {
    // Format phone number for Twilio
    const formattedNumber = `+1${phoneNumber.replace(/\D/g, '')}`;

    // Find the phone number in Twilio account
    const existingNumbers = await client.incomingPhoneNumbers.list({
      phoneNumber: formattedNumber,
    });

    if (existingNumbers.length === 0) {
      return {
        success: false,
        error: 'Phone number not found in your Twilio account',
      };
    }

    const phoneConfig = existingNumbers[0];

    // Update webhook configuration
    await client.incomingPhoneNumbers(phoneConfig.sid).update({
      voiceUrl: webhookUrl,
      voiceMethod: 'POST',
      voiceFallbackUrl: `${webhookUrl}/fallback`,
      voiceFallbackMethod: 'POST',
      statusCallback: `${webhookUrl}/status`,
      statusCallbackMethod: 'POST',
    });

    // Test webhook connectivity
    const webhookTest = await testWebhookConnectivity(webhookUrl);

    if (!webhookTest.success) {
      return {
        success: false,
        error:
          'Webhook URL is not accessible. Please check your configuration.',
      };
    }

    return {
      success: true,
      phoneNumber: phoneConfig.phoneNumber,
      phoneSid: phoneConfig.sid,
      message: 'Phone configuration verified successfully',
    };
  } catch (error) {
    console.error('Failed to verify existing phone:', error);
    return {
      success: false,
      error: 'Failed to verify phone configuration',
    };
  }
}

async function testWebhookConnectivity(
  webhookUrl: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'TwilioProxy/1.1',
      },
      body: 'CallSid=test&From=%2B15551234567&To=%2B15559876543&CallStatus=test',
    });

    return { success: response.status === 200 || response.status === 405 };
  } catch (error) {
    return { success: false };
  }
}
