import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { accountSid, authToken, phoneNumber, webhookUrl, isConnected } = await request.json();

    if (!accountSid || !authToken || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update user profile with Twilio configuration
    const { data, error } = await supabase
      .from('profiles')
      .update({
        twilio_account_sid: accountSid,
        twilio_auth_token: authToken, // Note: In production, encrypt this
        twilio_phone_number: phoneNumber,
        twilio_webhook_url: webhookUrl,
        twilio_connected: isConnected,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Twilio configuration saved successfully'
    });

  } catch (error) {
    console.error('Save config error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's Twilio configuration
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('twilio_account_sid, twilio_phone_number, twilio_webhook_url, twilio_connected')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      accountSid: profile?.twilio_account_sid || '',
      phoneNumber: profile?.twilio_phone_number || '',
      webhookUrl: profile?.twilio_webhook_url || process.env.TWILIO_WEBHOOK_URL,
      isConnected: profile?.twilio_connected || false
    });

  } catch (error) {
    console.error('Get config error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}