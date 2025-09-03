'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/components/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { UserSettings } from '@/types/settings.types';

interface AccountSettingsProps {
  settings: UserSettings;
  onUpdate: (
    section: 'profile',
    updates: Partial<UserSettings['profile']>
  ) => void;
  hasChanges: boolean;
  onSave: () => void;
  isSaving: boolean;
}

const timezones = [
  { value: 'Australia/Sydney', label: 'Sydney (GMT+10)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (GMT+10)' },
  { value: 'Australia/Brisbane', label: 'Brisbane (GMT+10)' },
  { value: 'Australia/Adelaide', label: 'Adelaide (GMT+9:30)' },
  { value: 'Australia/Perth', label: 'Perth (GMT+8)' },
  { value: 'Pacific/Auckland', label: 'Auckland (GMT+12)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
];

const languages = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish (Coming Soon)' },
  { value: 'french', label: 'French (Coming Soon)' },
];

export default function AccountSettings({
  settings,
  onUpdate,
  hasChanges,
  onSave,
  isSaving,
}: AccountSettingsProps) {
  const { user, profile } = useAuthContext();
  const [localSettings, setLocalSettings] = useState(settings.profile);

  const handleChange = (field: keyof UserSettings['profile'], value: any) => {
    const updates = { [field]: value };
    setLocalSettings((prev) => ({ ...prev, ...updates }));
    onUpdate('profile', updates);
  };

  const toggleBusinessDay = (day: string, enabled: boolean) => {
    if (!localSettings.businessHours) return;

    const updates = {
      businessHours: {
        ...localSettings.businessHours,
        [day]: {
          ...localSettings.businessHours[
            day as keyof typeof localSettings.businessHours
          ],
          enabled,
        },
      },
    };
    setLocalSettings((prev) => ({ ...prev, ...updates }));
    onUpdate('profile', updates);
  };

  const updateBusinessHours = (
    day: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    if (!localSettings.businessHours) return;

    const updates = {
      businessHours: {
        ...localSettings.businessHours,
        [day]: {
          ...localSettings.businessHours[
            day as keyof typeof localSettings.businessHours
          ],
          [field]: value,
        },
      },
    };
    setLocalSettings((prev) => ({ ...prev, ...updates }));
    onUpdate('profile', updates);
  };

  const businessDays = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Profile Information */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Profile Information
          </h3>
          <p className="text-muted-foreground text-sm">
            Update your personal and business information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={localSettings.displayName || profile?.full_name || ''}
              onChange={(e) => handleChange('displayName', e.target.value)}
              placeholder="Your full name"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              This name appears in emails and communications
            </p>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={localSettings.companyName || profile?.company_name || ''}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Your business name"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Used for branding in professional communications
            </p>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              value={localSettings.timezone || 'Australia/Sydney'}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Used for scheduling and calendar events
            </p>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              value={localSettings.language || 'english'}
              onChange={(e) => handleChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              AI processing and email language preference
            </p>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Business Hours
          </h3>
          <p className="text-muted-foreground text-sm">
            Configure your availability for appointment scheduling
          </p>
        </div>

        {/* Global Business Hours Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <h4 className="font-medium text-foreground">
              Enable Business Hours
            </h4>
            <p className="text-sm text-muted-foreground">
              Use these hours for scheduling and availability
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={localSettings.businessHours?.enabled || false}
              onChange={(e) =>
                handleChange('businessHours', {
                  ...localSettings.businessHours,
                  enabled: e.target.checked,
                })
              }
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Individual Day Settings */}
        {localSettings.businessHours?.enabled && (
          <div className="space-y-4">
            {businessDays.map((day) => {
              const daySettings =
                localSettings.businessHours?.[
                  day.key as keyof typeof localSettings.businessHours
                ];

              return (
                <div
                  key={day.key}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={daySettings?.enabled || false}
                        onChange={(e) =>
                          toggleBusinessDay(day.key, e.target.checked)
                        }
                      />
                      <div className="w-8 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                    <span className="font-medium text-foreground min-w-[80px]">
                      {day.label}
                    </span>
                  </div>

                  {daySettings?.enabled && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={daySettings.startTime}
                        onChange={(e) =>
                          updateBusinessHours(
                            day.key,
                            'startTime',
                            e.target.value
                          )
                        }
                        className="px-3 py-1.5 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      />
                      <span className="text-muted-foreground">to</span>
                      <input
                        type="time"
                        value={daySettings.endTime}
                        onChange={(e) =>
                          updateBusinessHours(
                            day.key,
                            'endTime',
                            e.target.value
                          )
                        }
                        className="px-3 py-1.5 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Account Information
          </h3>
          <p className="text-muted-foreground text-sm">
            Your account details and subscription status
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Email Address
              </Label>
              <p className="text-foreground font-medium">{user?.email}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Phone Number
              </Label>
              <p className="text-foreground font-medium">
                {profile?.phone_number || 'Not configured'}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Industry
              </Label>
              <p className="text-foreground font-medium capitalize">
                {profile?.industry_type?.replace('_', ' ') || 'Not configured'}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Subscription
              </Label>
              <p className="text-foreground font-medium capitalize">
                {profile?.subscription_tier || 'Basic'} Plan
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Label className="text-sm font-medium text-muted-foreground">
              Member Since
            </Label>
            <p className="text-foreground font-medium">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Save Changes */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-end space-x-4 pt-6 border-t border-border"
        >
          <Button
            variant="secondary"
            onClick={() => window.location.reload()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              'Save Changes'
            )}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
