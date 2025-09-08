// Flynn.ai v2 - AI Processing Settings API Route (Simplified)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return mock settings for now to prevent dashboard failures
    const mockSettings = {
      aiProcessingEnabled: true,
      forwardingSetupComplete: true,
      flynnNumber: '+61 2 8123 4567',
      userPhoneNumber: '+61 404 123 456',
      dailyLimit: 50,
      monthlyUsage: 12,
    };

    return NextResponse.json({
      success: true,
      settings: mockSettings,
    });
  } catch (error) {
    console.error('AI settings fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    if (typeof body.aiProcessingEnabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current settings
    const { data: currentData } = await supabase
      .from('users')
      .select('settings, phone_number')
      .eq('id', user.id)
      .single();

    const currentSettings = (currentData?.settings as any) || {};

    // Prepare updated settings
    const updatedSettings = {
      ...currentSettings,
      ai_processing_enabled: body.aiProcessingEnabled,
      updated_at: new Date().toISOString(),
    };

    // Update additional settings if provided
    if (body.settings?.dailyLimit) {
      updatedSettings.daily_processing_limit = Math.max(
        1,
        Math.min(1000, body.settings.dailyLimit)
      );
    }

    // Update user settings
    const { error } = await supabase
      .from('users')
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating AI settings:', error);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        aiProcessingEnabled: updatedSettings.ai_processing_enabled,
        forwardingSetupComplete: !!updatedSettings.forwarding_number,
        flynnNumber: updatedSettings.forwarding_number || null,
        userPhoneNumber: currentData?.phone_number,
        dailyLimit: updatedSettings.daily_processing_limit || 50,
        monthlyUsage: updatedSettings.monthly_processing_count || 0,
      },
    });
  } catch (error) {
    console.error('AI settings update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
