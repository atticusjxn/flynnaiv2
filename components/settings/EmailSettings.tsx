'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { UserSettings } from '@/types/settings.types';

interface EmailSettingsProps {
  settings: UserSettings;
  onUpdate: (section: 'email', updates: Partial<UserSettings['email']>) => void;
  hasChanges: boolean;
  onSave: () => void;
  isSaving: boolean;
}

const frequencyOptions = [
  { value: 'immediate', label: 'Immediate', description: 'Send emails as soon as calls are processed (within 2 minutes)' },
  { value: 'hourly', label: 'Hourly Digest', description: 'Bundle all new calls into hourly summaries' },
  { value: 'daily', label: 'Daily Digest', description: 'One summary email per day with all calls' },
  { value: 'weekly', label: 'Weekly Digest', description: 'Weekly summary of all call activity' },
];

const templateStyles = [
  { value: 'professional', label: 'Professional', description: 'Clean, business-focused layout with minimal branding' },
  { value: 'modern', label: 'Modern', description: 'Contemporary design with visual elements and icons' },
  { value: 'minimal', label: 'Minimal', description: 'Simple text-based format with essential information only' },
  { value: 'detailed', label: 'Detailed', description: 'Comprehensive layout with all available information' },
];

const weekDays = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export default function EmailSettings({ 
  settings, 
  onUpdate, 
  hasChanges, 
  onSave, 
  isSaving 
}: EmailSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings.email);

  const handleChange = (field: keyof UserSettings['email'], value: any) => {
    const updates = { [field]: value };
    setLocalSettings(prev => ({ ...prev, ...updates }));
    onUpdate('email', updates);
  };

  const toggleQuietHours = (enabled: boolean) => {
    const updates = {
      quietHours: {
        ...localSettings.quietHours,
        enabled
      }
    };
    setLocalSettings(prev => ({ ...prev, ...updates }));
    onUpdate('email', updates);
  };

  const updateQuietHours = (field: 'startTime' | 'endTime', value: string) => {
    const updates = {
      quietHours: {
        ...localSettings.quietHours,
        [field]: value
      }
    };
    setLocalSettings(prev => ({ ...prev, ...updates }));
    onUpdate('email', updates);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Notification Frequency */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Notification Frequency</h3>
          <p className="text-muted-foreground text-sm">
            Choose how often you receive email notifications about processed calls
          </p>
        </div>

        <div className="space-y-3">
          {frequencyOptions.map((option) => (
            <label 
              key={option.value}
              className={`flex items-start space-x-4 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/30 ${
                localSettings.frequency === option.value 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border'
              }`}
            >
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={localSettings.frequency === option.value}
                onChange={(e) => handleChange('frequency', e.target.value)}
                className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2 mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-foreground">{option.label}</div>
                <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Digest Time Settings */}
        {(localSettings.frequency === 'daily' || localSettings.frequency === 'weekly') && (
          <div className="bg-muted/20 rounded-lg p-4 space-y-4">
            <div>
              <Label htmlFor="digestTime">Delivery Time</Label>
              <input
                type="time"
                id="digestTime"
                value={localSettings.digestTime}
                onChange={(e) => handleChange('digestTime', e.target.value)}
                className="mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {localSettings.frequency === 'daily' ? 'Daily' : 'Weekly'} emails will be sent at this time
              </p>
            </div>

            {localSettings.frequency === 'weekly' && (
              <div>
                <Label htmlFor="weeklyDigestDay">Weekly Digest Day</Label>
                <select
                  id="weeklyDigestDay"
                  value={localSettings.weeklyDigestDay}
                  onChange={(e) => handleChange('weeklyDigestDay', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {weekDays.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Day of the week to send weekly digest
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Email Content */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Email Content</h3>
          <p className="text-muted-foreground text-sm">
            Customize what information is included in your email notifications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'includeCallSummary', label: 'Call Summary', description: 'AI-generated summary of the conversation' },
            { key: 'includeEventDetails', label: 'Event Details', description: 'Extracted appointments and meetings' },
            { key: 'includeCustomerInfo', label: 'Customer Information', description: 'Contact details and customer notes' },
            { key: 'includeTranscript', label: 'Call Transcript', description: 'Full text transcription of the call' },
            { key: 'includeRecordingLink', label: 'Recording Link', description: 'Link to access the call recording' },
            { key: 'autoAttachICS', label: 'Calendar Files (.ics)', description: 'Attach calendar files for easy import' },
          ].map((item) => (
            <label key={item.key} className="flex items-start space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/20 transition-colors">
              <input
                type="checkbox"
                checked={localSettings[item.key as keyof typeof localSettings] as boolean}
                onChange={(e) => handleChange(item.key as keyof UserSettings['email'], e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 mt-1"
              />
              <div>
                <div className="font-medium text-foreground text-sm">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Email Format & Style */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Email Format & Style</h3>
          <p className="text-muted-foreground text-sm">
            Choose the appearance and format of your email notifications
          </p>
        </div>

        {/* Email Format */}
        <div className="space-y-3">
          <Label>Email Format</Label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/20 transition-colors">
              <input
                type="radio"
                name="format"
                value="html"
                checked={localSettings.format === 'html'}
                onChange={(e) => handleChange('format', e.target.value)}
                className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
              />
              <div>
                <div className="font-medium text-foreground text-sm">HTML (Recommended)</div>
                <div className="text-xs text-muted-foreground">Rich formatting with colors and layout</div>
              </div>
            </label>
            <label className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/20 transition-colors">
              <input
                type="radio"
                name="format"
                value="text"
                checked={localSettings.format === 'text'}
                onChange={(e) => handleChange('format', e.target.value)}
                className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
              />
              <div>
                <div className="font-medium text-foreground text-sm">Plain Text</div>
                <div className="text-xs text-muted-foreground">Simple text-only format</div>
              </div>
            </label>
          </div>
        </div>

        {/* Template Style */}
        <div className="space-y-3">
          <Label>Template Style</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templateStyles.map((style) => (
              <label 
                key={style.value}
                className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/30 ${
                  localSettings.templateStyle === style.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border'
                }`}
              >
                <input
                  type="radio"
                  name="templateStyle"
                  value={style.value}
                  checked={localSettings.templateStyle === style.value}
                  onChange={(e) => handleChange('templateStyle', e.target.value)}
                  className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2 mt-1"
                />
                <div>
                  <div className="font-medium text-foreground text-sm">{style.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{style.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Branding Options */}
        <div className="space-y-4">
          <Label>Branding Options</Label>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <div className="font-medium text-foreground text-sm">Flynn.ai Branding</div>
                <div className="text-xs text-muted-foreground">Include Flynn.ai logo and branding in emails</div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.brandingEnabled}
                onChange={(e) => handleChange('brandingEnabled', e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
              />
            </label>

            <div className="space-y-2">
              <Label htmlFor="customSignature">Custom Signature</Label>
              <textarea
                id="customSignature"
                value={localSettings.customSignature || ''}
                onChange={(e) => handleChange('customSignature', e.target.value)}
                placeholder="Add a custom signature to your emails (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This signature will be added to the end of all email notifications
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Preferences */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Delivery Preferences</h3>
          <p className="text-muted-foreground text-sm">
            Control when and how emails are delivered
          </p>
        </div>

        <div className="space-y-4">
          {/* Business Hours Only */}
          <label className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">Business Hours Only</div>
              <div className="text-sm text-muted-foreground">Only send emails during your configured business hours</div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.businessHoursOnly}
              onChange={(e) => handleChange('businessHoursOnly', e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
          </label>

          {/* Quiet Hours */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">Quiet Hours</div>
                <div className="text-sm text-muted-foreground">Don't send emails during specified quiet hours</div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.quietHours?.enabled || false}
                onChange={(e) => toggleQuietHours(e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
              />
            </label>

            {localSettings.quietHours?.enabled && (
              <div className="flex items-center space-x-4 pt-3 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="quietStart" className="text-sm">From</Label>
                  <input
                    type="time"
                    id="quietStart"
                    value={localSettings.quietHours.startTime}
                    onChange={(e) => updateQuietHours('startTime', e.target.value)}
                    className="px-3 py-1.5 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="quietEnd" className="text-sm">To</Label>
                  <input
                    type="time"
                    id="quietEnd"
                    value={localSettings.quietHours.endTime}
                    onChange={(e) => updateQuietHours('endTime', e.target.value)}
                    className="px-3 py-1.5 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Include Manage Event Links */}
          <label className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">Event Management Links</div>
              <div className="text-sm text-muted-foreground">Include links to confirm, edit, or reschedule events</div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.includeManageEventLinks}
              onChange={(e) => handleChange('includeManageEventLinks', e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
          </label>
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