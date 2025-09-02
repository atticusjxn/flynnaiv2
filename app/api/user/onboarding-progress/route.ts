// Flynn.ai v2 - User Onboarding Progress API Route
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve user settings and calculate onboarding progress
    const { data, error } = await supabase
      .from('users')
      .select('settings, industry_type, phone_number, company_name, full_name')
      .eq('id', user.id)
      .maybeSingle();

    // Handle case where user record doesn't exist yet - return default progress
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching onboarding progress:', error);
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }

    // If no user record exists, return default onboarding state
    if (!data) {
      return NextResponse.json({
        success: true,
        progress: {},
        completed: false,
        userInfo: {
          industryType: null,
          phoneNumber: null,
          companyName: null,
          fullName: null,
        },
      });
    }

    // Calculate onboarding progress based on completed steps
    const progress = {
      step1_industry: !!data?.industry_type,
      step2_phone_setup: !!data?.phone_number,
      step3_ai_processing: !!(data?.settings as any)?.ai_processing_enabled,
    };

    const completed = progress.step1_industry && progress.step2_phone_setup && progress.step3_ai_processing;

    return NextResponse.json({
      success: true,
      progress,
      completed,
      userInfo: {
        industryType: data?.industry_type,
        phoneNumber: data?.phone_number,
        companyName: data?.company_name,
        fullName: data?.full_name,
      },
    });

  } catch (error) {
    console.error('Onboarding progress fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { progress } = await request.json();
    
    const supabase = createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user data to merge settings
    const { data: userData } = await supabase
      .from('users')
      .select('settings')
      .eq('id', user.id)
      .single();

    // Update user settings based on progress
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Update industry if provided
    if (progress.industry) {
      updateData.industry_type = progress.industry;
    }

    // Update phone if provided
    if (progress.phoneConfig?.phoneNumber) {
      updateData.phone_number = progress.phoneConfig.phoneNumber;
    }

    // Update settings if provided
    if (progress.aiProcessingEnabled !== undefined) {
      updateData.settings = {
        ...((userData?.settings as any) || {}),
        ai_processing_enabled: progress.aiProcessingEnabled
      };
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating onboarding progress:', error);
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }

    // Additional updates are handled above in the main update

    // Track onboarding milestone
    await trackOnboardingMilestone(user.id, progress);

    return NextResponse.json({
      success: true,
      message: 'Onboarding progress updated successfully'
    });

  } catch (error) {
    console.error('Onboarding progress update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to track onboarding milestones for analytics
async function trackOnboardingMilestone(userId: string, progress: any) {
  try {
    const supabase = createClient();
    
    // Determine current milestone
    let milestone = '';
    if (progress.completed) {
      milestone = 'onboarding_completed';
    } else if (progress.emailPreferences) {
      milestone = 'email_preferences_set';
    } else if (progress.calendarConnected) {
      milestone = 'calendar_connected';
    } else if (progress.phoneConfig?.verified) {
      milestone = 'phone_verified';
    } else if (progress.industry) {
      milestone = 'industry_selected';
    }

    if (milestone) {
      await supabase
        .from('user_events')
        .insert({
          user_id: userId,
          event_type: milestone,
          event_data: progress,
          created_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Failed to track onboarding milestone:', error);
  }
}