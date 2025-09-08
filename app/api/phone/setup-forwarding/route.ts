// Flynn.ai v2 - Call Forwarding Setup API Route
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
  try {
    const { userPhoneNumber, preferredAreaCode } = await request.json();

    const supabase = createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or purchase a Flynn.ai forwarding number
    const forwardingSetup = await setupCallForwarding(
      userPhoneNumber,
      preferredAreaCode
    );

    if (!forwardingSetup.success) {
      return NextResponse.json(
        {
          error: forwardingSetup.error || 'Failed to setup call forwarding',
        },
        { status: 400 }
      );
    }

    // Save forwarding configuration to user profile
    const { error: updateError } = await supabase
      .from('users')
      .update({
        forwarding_number: forwardingSetup.flynnNumber,
        user_phone_number: userPhoneNumber,
        twilio_phone_sid: forwardingSetup.phoneSid,
        forwarding_setup_complete: true,
        ai_processing_enabled: true, // Enable by default
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to save forwarding config:', updateError);
      return NextResponse.json(
        { error: 'Failed to save configuration' },
        { status: 500 }
      );
    }

    // Send SMS with forwarding instructions
    await sendForwardingInstructions(
      userPhoneNumber,
      forwardingSetup.flynnNumber
    );

    // Log successful setup
    await supabase.from('user_events').insert({
      user_id: user.id,
      event_type: 'call_forwarding_setup',
      event_data: {
        user_phone: userPhoneNumber,
        flynn_number: forwardingSetup.flynnNumber,
        setup_method: 'automatic',
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      flynnNumber: forwardingSetup.flynnNumber,
      forwardingCode: generateForwardingCode(forwardingSetup.flynnNumber),
      message: 'Call forwarding setup complete',
    });
  } catch (error) {
    console.error('Call forwarding setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}

async function setupCallForwarding(
  userPhoneNumber: string,
  preferredAreaCode?: string
) {
  try {
    // Search for available phone numbers
    const availableNumbers = await client
      .availablePhoneNumbers('AU')
      .local.list({
        areaCode: preferredAreaCode || undefined,
        limit: 1,
      });

    if (availableNumbers.length === 0) {
      // Fallback to any available Australian number
      const fallbackNumbers = await client
        .availablePhoneNumbers('AU')
        .local.list({ limit: 1 });
      if (fallbackNumbers.length === 0) {
        return {
          success: false,
          error: 'No phone numbers available at the moment',
        };
      }
      availableNumbers.push(fallbackNumbers[0]);
    }

    const selectedNumber = availableNumbers[0];

    // Purchase and configure the Flynn.ai number
    const flynnNumber = await client.incomingPhoneNumbers.create({
      phoneNumber: selectedNumber.phoneNumber,
      voiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/call-forwarding`,
      voiceMethod: 'POST',
      voiceFallbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/call-forwarding/fallback`,
      voiceFallbackMethod: 'POST',
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/call-forwarding/status`,
      statusCallbackMethod: 'POST',
      // Configure to forward to user's actual phone number
      friendlyName: `Flynn.ai Forwarding - ${userPhoneNumber}`,
    });

    return {
      success: true,
      flynnNumber: flynnNumber.phoneNumber,
      phoneSid: flynnNumber.sid,
    };
  } catch (error) {
    console.error('Failed to setup call forwarding:', error);
    return {
      success: false,
      error: 'Failed to configure phone number',
    };
  }
}

async function sendForwardingInstructions(
  userPhoneNumber: string,
  flynnNumber: string
) {
  try {
    const forwardingCode = generateForwardingCode(flynnNumber);

    const message = `🎉 Flynn.ai setup complete!

Your personal AI assistant is ready. To activate:

📞 Dial: ${forwardingCode}
✅ Press call - that's it!

Now ALL your calls will be automatically processed by Flynn.ai. You'll get SMS summaries and calendar events after each business call.

Turn AI on/off anytime from your dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Questions? Reply HELP`;

    await client.messages.create({
      body: message,
      from: flynnNumber, // Send from their Flynn.ai number
      to: userPhoneNumber,
    });
  } catch (error) {
    console.error('Failed to send forwarding instructions:', error);
    // Don't fail the entire setup if SMS fails
  }
}

function generateForwardingCode(flynnNumber: string): string {
  // Convert Flynn.ai number to Australian call forwarding format
  // Example: +61234567890 becomes *21*61234567890#
  const cleanNumber = flynnNumber.replace(/\D/g, '');

  // For Australian numbers, use the standard call forwarding prefix
  return `*21*${cleanNumber}#`;
}

// Get forwarding status for a user
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('users')
      .select(
        'forwarding_number, user_phone_number, forwarding_setup_complete, ai_processing_enabled'
      )
      .eq('id', user.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to get status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      isSetup: data?.forwarding_setup_complete || false,
      flynnNumber: data?.forwarding_number,
      userPhoneNumber: data?.user_phone_number,
      aiProcessingEnabled: data?.ai_processing_enabled || false,
      forwardingCode: data?.forwarding_number
        ? generateForwardingCode(data.forwarding_number)
        : null,
    });
  } catch (error) {
    console.error('Get forwarding status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
