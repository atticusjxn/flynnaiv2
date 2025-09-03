'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { UserSettings } from '@/types/settings.types';

interface NotificationSettingsProps {
  settings: UserSettings;
  onUpdate: (
    section: 'notifications',
    updates: Partial<UserSettings['notifications']>
  ) => void;
  hasChanges: boolean;
  onSave: () => void;
  isSaving: boolean;
}

const notificationPositions = [
  { value: 'top-right', label: 'Top Right' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
];

export default function NotificationSettings({
  settings,
  onUpdate,
  hasChanges,
  onSave,
  isSaving,
}: NotificationSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings.notifications);

  const handleEmailToggle = (
    key: keyof UserSettings['notifications']['email'],
    value: boolean
  ) => {
    const updates = {
      email: {
        ...localSettings.email,
        [key]: value,
      },
    };
    setLocalSettings((prev) => ({ ...prev, ...updates }));
    onUpdate('notifications', updates);
  };

  const handleSmsToggle = (
    key: keyof UserSettings['notifications']['sms'],
    value: boolean
  ) => {
    const updates = {
      sms: {
        ...localSettings.sms,
        [key]: value,
      },
    };
    setLocalSettings((prev) => ({ ...prev, ...updates }));
    onUpdate('notifications', updates);
  };

  const handlePushToggle = (
    key: keyof UserSettings['notifications']['push'],
    value: boolean
  ) => {
    const updates = {
      push: {
        ...localSettings.push,
        [key]: value,
      },
    };
    setLocalSettings((prev) => ({ ...prev, ...updates }));
    onUpdate('notifications', updates);
  };

  const handleInAppUpdate = (
    key: keyof UserSettings['notifications']['inApp'],
    value: any
  ) => {
    const updates = {
      inApp: {
        ...localSettings.inApp,
        [key]: value,
      },
    };
    setLocalSettings((prev) => ({ ...prev, ...updates }));
    onUpdate('notifications', updates);
  };

  const handleQuietHoursUpdate = (
    key: keyof UserSettings['notifications']['quietHours'],
    value: any
  ) => {
    const updates = {
      quietHours: {
        ...localSettings.quietHours,
        [key]: value,
      },
    };
    setLocalSettings((prev) => ({ ...prev, ...updates }));
    onUpdate('notifications', updates);
  };

  const testNotification = () => {
    // This would trigger a test notification in a real implementation
    alert('Test notification sent! (This is a demo)');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Email Notifications */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Email Notifications
          </h3>
          <p className="text-muted-foreground text-sm">
            Choose which email notifications you want to receive
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              key: 'newCall',
              label: 'New Call Processed',
              description: 'When a new call has been processed by AI',
            },
            {
              key: 'eventExtracted',
              label: 'Event Extracted',
              description: 'When an appointment or meeting is found in a call',
            },
            {
              key: 'eventConfirmed',
              label: 'Event Confirmed',
              description: 'When you or a customer confirms an appointment',
            },
            {
              key: 'eventReminder',
              label: 'Event Reminders',
              description: 'Reminders before scheduled appointments',
            },
            {
              key: 'systemUpdates',
              label: 'System Updates',
              description: 'Important system updates and maintenance notices',
            },
            {
              key: 'weeklyDigest',
              label: 'Weekly Digest',
              description: 'Weekly summary of your call activity and insights',
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-start space-x-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/20 transition-colors"
            >
              <input
                type="checkbox"
                checked={
                  localSettings.email[
                    item.key as keyof typeof localSettings.email
                  ]
                }
                onChange={(e) =>
                  handleEmailToggle(
                    item.key as keyof typeof localSettings.email,
                    e.target.checked
                  )
                }
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-foreground">{item.label}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {item.description}
                </div>
              </div>
            </label>
          ))}

          {/* Urgent Only Override */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <label className="flex items-start space-x-4 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.email.urgentOnly}
                onChange={(e) =>
                  handleEmailToggle('urgentOnly', e.target.checked)
                }
                className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500 focus:ring-2 mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-amber-800">
                  Urgent Calls Only
                </div>
                <div className="text-sm text-amber-700 mt-1">
                  Override all settings and only receive emails for
                  urgent/emergency calls
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            SMS Notifications
          </h3>
          <p className="text-muted-foreground text-sm">
            Configure SMS notifications to your verified phone number
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">
                Enable SMS Notifications
              </div>
              <div className="text-sm text-muted-foreground">
                Send important notifications via SMS
              </div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.sms.enabled}
              onChange={(e) => handleSmsToggle('enabled', e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
          </label>

          {localSettings.sms.enabled && (
            <div className="bg-muted/20 rounded-lg p-4 space-y-3">
              {[
                {
                  key: 'emergencyOnly',
                  label: 'Emergency Calls Only',
                  description: 'Only send SMS for urgent/emergency calls',
                },
                {
                  key: 'eventReminders',
                  label: 'Event Reminders',
                  description: 'SMS reminders before appointments',
                },
                {
                  key: 'systemAlerts',
                  label: 'System Alerts',
                  description: 'Critical system alerts and downtime notices',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start space-x-4 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      localSettings.sms[
                        item.key as keyof typeof localSettings.sms
                      ] as boolean
                    }
                    onChange={(e) =>
                      handleSmsToggle(
                        item.key as keyof typeof localSettings.sms,
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm">
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </label>
              ))}

              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                SMS notifications will be sent to your verified phone number.
                Standard messaging rates may apply.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Push Notifications
          </h3>
          <p className="text-muted-foreground text-sm">
            Browser push notifications for real-time updates (requires browser
            permission)
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">
                Enable Push Notifications
              </div>
              <div className="text-sm text-muted-foreground">
                Show browser notifications for important updates
              </div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.push.enabled}
              onChange={(e) => handlePushToggle('enabled', e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
          </label>

          {localSettings.push.enabled && (
            <div className="bg-muted/20 rounded-lg p-4 space-y-3">
              {[
                {
                  key: 'newCall',
                  label: 'New Call Processed',
                  description: 'Notify when a new call is processed',
                },
                {
                  key: 'eventExtracted',
                  label: 'Event Extracted',
                  description: 'Notify when appointments are found',
                },
                {
                  key: 'eventConfirmed',
                  label: 'Event Confirmed',
                  description: 'Notify when events are confirmed',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start space-x-4 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      localSettings.push[
                        item.key as keyof typeof localSettings.push
                      ] as boolean
                    }
                    onChange={(e) =>
                      handlePushToggle(
                        item.key as keyof typeof localSettings.push,
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm">
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </label>
              ))}

              <label className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <div className="font-medium text-foreground text-sm">
                    Show Content Preview
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Include call details in notification preview
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.push.showPreview}
                  onChange={(e) =>
                    handlePushToggle('showPreview', e.target.checked)
                  }
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* In-App Notifications */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            In-App Notifications
          </h3>
          <p className="text-muted-foreground text-sm">
            Customize how notifications appear within the Flynn.ai dashboard
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">
                Enable In-App Notifications
              </div>
              <div className="text-sm text-muted-foreground">
                Show notifications within the dashboard
              </div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.inApp.enabled}
              onChange={(e) => handleInAppUpdate('enabled', e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
          </label>

          {localSettings.inApp.enabled && (
            <div className="bg-muted/20 rounded-lg p-4 space-y-4">
              {/* Position */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Notification Position
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {notificationPositions.map((position) => (
                    <label
                      key={position.value}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors text-sm ${
                        localSettings.inApp.position === position.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="notificationPosition"
                        value={position.value}
                        checked={
                          localSettings.inApp.position === position.value
                        }
                        onChange={(e) =>
                          handleInAppUpdate('position', e.target.value)
                        }
                        className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                      />
                      <span>{position.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label
                  htmlFor="notificationDuration"
                  className="text-sm font-medium"
                >
                  Auto-hide Duration (seconds)
                </Label>
                <input
                  type="range"
                  id="notificationDuration"
                  min="3"
                  max="15"
                  step="1"
                  value={localSettings.inApp.duration / 1000}
                  onChange={(e) =>
                    handleInAppUpdate(
                      'duration',
                      parseInt(e.target.value) * 1000
                    )
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>3s</span>
                  <span className="font-medium">
                    {localSettings.inApp.duration / 1000}s
                  </span>
                  <span>15s</span>
                </div>
              </div>

              {/* Notification Types */}
              <div className="space-y-3 pt-3 border-t border-border">
                <Label className="text-sm font-medium">
                  Show Notification Types
                </Label>
                {[
                  {
                    key: 'showSuccess',
                    label: 'Success Notifications',
                    description: 'Successful operations and confirmations',
                  },
                  {
                    key: 'showErrors',
                    label: 'Error Notifications',
                    description: 'Errors and failed operations',
                  },
                  {
                    key: 'showInfo',
                    label: 'Info Notifications',
                    description: 'General information and updates',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start space-x-4 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        localSettings.inApp[
                          item.key as keyof typeof localSettings.inApp
                        ] as boolean
                      }
                      onChange={(e) =>
                        handleInAppUpdate(item.key, e.target.checked)
                      }
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-foreground text-sm">
                        {item.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Do Not Disturb */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Do Not Disturb
          </h3>
          <p className="text-muted-foreground text-sm">
            Set quiet hours to reduce notifications during specific times
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">
                Enable Quiet Hours
              </div>
              <div className="text-sm text-muted-foreground">
                Suppress notifications during specified hours
              </div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.quietHours.enabled}
              onChange={(e) =>
                handleQuietHoursUpdate('enabled', e.target.checked)
              }
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
          </label>

          {localSettings.quietHours.enabled && (
            <div className="bg-muted/20 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quietStart" className="text-sm font-medium">
                    Start Time
                  </Label>
                  <input
                    type="time"
                    id="quietStart"
                    value={localSettings.quietHours.startTime}
                    onChange={(e) =>
                      handleQuietHoursUpdate('startTime', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quietEnd" className="text-sm font-medium">
                    End Time
                  </Label>
                  <input
                    type="time"
                    id="quietEnd"
                    value={localSettings.quietHours.endTime}
                    onChange={(e) =>
                      handleQuietHoursUpdate('endTime', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <label className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <div className="font-medium text-foreground text-sm">
                    Allow Emergency Notifications
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Override quiet hours for emergency calls
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.quietHours.allowEmergency}
                  onChange={(e) =>
                    handleQuietHoursUpdate('allowEmergency', e.target.checked)
                  }
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Test Notifications */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Test Notifications
          </h3>
          <p className="text-muted-foreground text-sm">
            Send a test notification to verify your settings are working
            correctly
          </p>
        </div>

        <div className="bg-muted/20 rounded-lg p-4">
          <Button
            onClick={testNotification}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Send Test Notification
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            This will send a test notification using your current settings
          </p>
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
