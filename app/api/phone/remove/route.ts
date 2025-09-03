import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove phone number from user profile
    const { error } = await supabase
      .from('users')
      .update({
        phone_number: null,
        settings: {
          phone_verified: false,
          phone_number_pending: null,
          verification_timestamp: null,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to remove phone number' },
        { status: 500 }
      );
    }

    // TODO: In a real implementation, you would:
    // 1. Release the Twilio phone number
    // 2. Clean up webhook configurations
    // 3. Handle any active call routing

    return NextResponse.json({
      success: true,
      message: 'Phone number removed successfully',
    });
  } catch (error) {
    console.error('Remove phone error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
