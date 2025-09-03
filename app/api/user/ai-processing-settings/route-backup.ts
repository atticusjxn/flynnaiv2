// Flynn.ai v2 - AI Processing Settings API Route
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  AIProcessingSettingsSchema,
  validateUserId,
} from '@/lib/validation/schemas';
import { createErrorResponse, Logger } from '@/lib/utils/errorHandling';
import { withRateLimit, rateLimiters } from '@/lib/utils/rateLimiting';

export async function GET(request: NextRequest) {
  return withRateLimit(rateLimiters.userSettings)(request, async (req) => {
    const logger = new Logger('AIProcessingSettingsAPI');

    try {
      const supabase = createClient();

      // Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Validate user ID
      const validatedUserId = validateUserId(user.id);

      logger.info('Fetching AI processing settings', {
        userId: validatedUserId,
      });

      // Get current AI processing settings from user settings JSON
      const { data, error } = await supabase
        .from('users')
        .select('settings, phone_number')
        .eq('id', validatedUserId)
        .single();

      if (error) {
        logger.error('Error fetching AI settings', error);
        throw error;
      }

      const settings = (data?.settings as any) || {};

      return NextResponse.json({
        success: true,
        settings: {
          aiProcessingEnabled: settings.ai_processing_enabled || false,
          forwardingSetupComplete: !!settings.forwarding_number,
          flynnNumber: settings.forwarding_number || null,
          userPhoneNumber: data?.phone_number,
          dailyLimit: settings.daily_processing_limit || 50,
          monthlyUsage: settings.monthly_processing_count || 0,
        },
      });
    } catch (error) {
      logger.error(
        'AI settings fetch error',
        error instanceof Error ? error : new Error(String(error))
      );
      return createErrorResponse(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withRateLimit(rateLimiters.userSettings)(request, async (req) => {
    const logger = new Logger('AIProcessingSettingsAPI');

    try {
      // Parse and validate request body
      const body = await req.json();
      const validatedData = AIProcessingSettingsSchema.parse(body);

      const supabase = createClient();

      // Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Validate user ID
      const validatedUserId = validateUserId(user.id);

      logger.info('Updating AI processing settings', {
        userId: validatedUserId,
        aiProcessingEnabled: validatedData.aiProcessingEnabled,
      });

      // Get current settings
      const { data: currentData } = await supabase
        .from('users')
        .select('settings, phone_number')
        .eq('id', validatedUserId)
        .single();

      const currentSettings = (currentData?.settings as any) || {};

      // Prepare updated settings
      const updatedSettings = {
        ...currentSettings,
        ai_processing_enabled: validatedData.aiProcessingEnabled,
        updated_at: new Date().toISOString(),
      };

      // Update additional settings if provided
      if (validatedData.settings?.dailyLimit) {
        updatedSettings.daily_processing_limit = Math.max(
          1,
          Math.min(1000, validatedData.settings.dailyLimit)
        );
      }

      // Update user settings
      const { error } = await supabase
        .from('users')
        .update({
          settings: updatedSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validatedUserId);

      if (error) {
        logger.error('Error updating AI settings', error);
        throw error;
      }

      // Log the settings change
      try {
        await supabase.from('user_events').insert({
          user_id: validatedUserId,
          event_type: 'ai_processing_settings_changed',
          event_data: {
            ai_processing_enabled: validatedData.aiProcessingEnabled,
            settings: validatedData.settings || {},
            changed_at: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
        });
      } catch (logError) {
        logger.warn(
          'Failed to log settings change',
          logError instanceof Error ? logError : new Error(String(logError))
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
      logger.error(
        'AI settings update error',
        error instanceof Error ? error : new Error(String(error))
      );
      return createErrorResponse(error);
    }
  });
}
