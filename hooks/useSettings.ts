'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { 
  UserSettings, 
  DEFAULT_USER_SETTINGS, 
  SettingsUpdateRequest,
  SettingsSaveResponse 
} from '@/types/settings.types';
import { createClient } from '@/utils/supabase/client';

interface UseSettingsReturn {
  // Current settings state
  settings: UserSettings;
  originalSettings: UserSettings;
  
  // Loading and error states
  isLoading: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  error: string | null;
  
  // Settings manipulation
  updateSettings: <T extends keyof UserSettings>(
    section: T, 
    updates: Partial<UserSettings[T]>
  ) => void;
  
  // Persistence
  saveSettings: () => Promise<boolean>;
  resetSettings: () => void;
  resetToDefaults: () => void;
  
  // Validation
  validateSettings: () => string[];
  
  // Individual setting getters for convenience
  getProfile: () => UserSettings['profile'];
  getEmail: () => UserSettings['email'];
  getCalendar: () => UserSettings['calendar'];
  getNotifications: () => UserSettings['notifications'];
  getAI: () => UserSettings['ai'];
  getUI: () => UserSettings['ui'];
}

export function useSettings(): UseSettingsReturn {
  const { user, profile } = useAuthContext();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  // Calculate if there are unsaved changes
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  // Load settings from the user profile
  useEffect(() => {
    if (!profile) {
      setIsLoading(false);
      return;
    }

    try {
      // Parse settings from user profile, merge with defaults
      const userSettings = profile.settings as UserSettings | null;
      const loadedSettings = userSettings 
        ? mergeWithDefaults(userSettings, DEFAULT_USER_SETTINGS)
        : DEFAULT_USER_SETTINGS;

      setSettings(loadedSettings);
      setOriginalSettings(loadedSettings);
      setError(null);
    } catch (err) {
      console.error('Error loading user settings:', err);
      setError('Failed to load settings');
      // Fall back to defaults
      setSettings(DEFAULT_USER_SETTINGS);
      setOriginalSettings(DEFAULT_USER_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  // Update settings section
  const updateSettings = useCallback(<T extends keyof UserSettings>(
    section: T, 
    updates: Partial<UserSettings[T]>
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
    setError(null);
  }, []);

  // Save settings to database
  const saveSettings = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Validate settings before saving
      const validationErrors = validateSettingsData(settings);
      if (validationErrors.length > 0) {
        setError(`Validation failed: ${validationErrors.join(', ')}`);
        return false;
      }

      // Update user profile with new settings
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          settings: settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update original settings to reflect saved state
      setOriginalSettings(settings);
      return true;

    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, settings, supabase]);

  // Reset to last saved version
  const resetSettings = useCallback(() => {
    setSettings(originalSettings);
    setError(null);
  }, [originalSettings]);

  // Reset to system defaults
  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_USER_SETTINGS);
    setError(null);
  }, []);

  // Validate current settings
  const validateSettings = useCallback((): string[] => {
    return validateSettingsData(settings);
  }, [settings]);

  // Convenience getters
  const getProfile = useCallback(() => settings.profile, [settings.profile]);
  const getEmail = useCallback(() => settings.email, [settings.email]);
  const getCalendar = useCallback(() => settings.calendar, [settings.calendar]);
  const getNotifications = useCallback(() => settings.notifications, [settings.notifications]);
  const getAI = useCallback(() => settings.ai, [settings.ai]);
  const getUI = useCallback(() => settings.ui, [settings.ui]);

  return {
    settings,
    originalSettings,
    isLoading,
    isSaving,
    hasChanges,
    error,
    updateSettings,
    saveSettings,
    resetSettings,
    resetToDefaults,
    validateSettings,
    getProfile,
    getEmail,
    getCalendar,
    getNotifications,
    getAI,
    getUI,
  };
}

// Helper function to merge user settings with defaults
function mergeWithDefaults(userSettings: any, defaults: UserSettings): UserSettings {
  const merged = { ...defaults };

  // Deep merge each section
  if (userSettings.profile) {
    merged.profile = { ...defaults.profile, ...userSettings.profile };
  }
  if (userSettings.email) {
    merged.email = { ...defaults.email, ...userSettings.email };
  }
  if (userSettings.calendar) {
    merged.calendar = { ...defaults.calendar, ...userSettings.calendar };
  }
  if (userSettings.notifications) {
    merged.notifications = {
      email: { ...defaults.notifications.email, ...userSettings.notifications.email },
      sms: { ...defaults.notifications.sms, ...userSettings.notifications.sms },
      push: { ...defaults.notifications.push, ...userSettings.notifications.push },
      inApp: { ...defaults.notifications.inApp, ...userSettings.notifications.inApp },
      quietHours: { ...defaults.notifications.quietHours, ...userSettings.notifications.quietHours },
    };
  }
  if (userSettings.ai) {
    merged.ai = { ...defaults.ai, ...userSettings.ai };
  }
  if (userSettings.ui) {
    merged.ui = { ...defaults.ui, ...userSettings.ui };
  }

  // Update version if provided
  if (userSettings.version) {
    merged.version = userSettings.version;
  }

  return merged;
}

// Settings validation function
function validateSettingsData(settings: UserSettings): string[] {
  const errors: string[] = [];

  // Validate profile settings
  if (settings.profile.timezone && !isValidTimezone(settings.profile.timezone)) {
    errors.push('Invalid timezone');
  }

  // Validate email settings
  if (settings.email.frequency && !['immediate', 'hourly', 'daily', 'weekly'].includes(settings.email.frequency)) {
    errors.push('Invalid email frequency');
  }

  // Validate AI settings
  if (settings.ai.autoConfirmThreshold < 0 || settings.ai.autoConfirmThreshold > 1) {
    errors.push('Auto-confirm threshold must be between 0 and 1');
  }
  if (settings.ai.humanReviewThreshold < 0 || settings.ai.humanReviewThreshold > 1) {
    errors.push('Human review threshold must be between 0 and 1');
  }

  // Validate calendar settings
  if (settings.calendar.defaultDuration <= 0) {
    errors.push('Default duration must be greater than 0');
  }

  // Validate notification settings
  if (settings.notifications.quietHours.enabled) {
    if (!isValidTimeFormat(settings.notifications.quietHours.startTime)) {
      errors.push('Invalid quiet hours start time');
    }
    if (!isValidTimeFormat(settings.notifications.quietHours.endTime)) {
      errors.push('Invalid quiet hours end time');
    }
  }

  return errors;
}

// Helper validation functions
function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

function isValidTimeFormat(time: string): boolean {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

export default useSettings;