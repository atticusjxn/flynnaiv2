'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { UserSettings } from '@/types/settings.types';
import CalendarIntegrationSection from '@/components/calendar/CalendarIntegrationSection';

interface CalendarSettingsProps {
  settings: UserSettings;
  onUpdate: (section: 'calendar', updates: Partial<UserSettings['calendar']>) => void;
  hasChanges: boolean;
  onSave: () => void;
  isSaving: boolean;
}

const conflictResolutionOptions = [
  { value: 'manual', label: 'Manual Review', description: 'I will manually resolve any calendar conflicts' },
  { value: 'auto_reschedule', label: 'Auto Reschedule', description: 'Automatically reschedule conflicting events to nearby times' },
  { value: 'skip_conflicts', label: 'Skip Conflicts', description: 'Don\'t create calendar events when conflicts are detected' },
];

const reminderOptions = [
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 1440, label: '1 day' },
];

const eventColors = [
  { value: '#1f77b4', label: 'Blue', color: 'bg-blue-500' },
  { value: '#ff7f0e', label: 'Orange', color: 'bg-orange-500' },
  { value: '#2ca02c', label: 'Green', color: 'bg-green-500' },
  { value: '#d62728', label: 'Red', color: 'bg-red-500' },
  { value: '#9467bd', label: 'Purple', color: 'bg-purple-500' },
  { value: '#8c564b', label: 'Brown', color: 'bg-amber-700' },
  { value: '#e377c2', label: 'Pink', color: 'bg-pink-500' },
  { value: '#7f7f7f', label: 'Gray', color: 'bg-gray-500' },
];

export default function CalendarSettings({ 
  settings, 
  onUpdate, 
  hasChanges, 
  onSave, 
  isSaving 
}: CalendarSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings.calendar);

  const handleChange = (field: keyof UserSettings['calendar'], value: any) => {
    const updates = { [field]: value };
    setLocalSettings(prev => ({ ...prev, ...updates }));
    onUpdate('calendar', updates);
  };

  const toggleReminder = (minutes: number) => {
    const currentReminders = localSettings.reminderMinutes || [];
    const isEnabled = currentReminders.includes(minutes);
    
    let newReminders;
    if (isEnabled) {
      newReminders = currentReminders.filter(m => m !== minutes);
    } else {
      newReminders = [...currentReminders, minutes].sort((a, b) => a - b);
    }
    
    handleChange('reminderMinutes', newReminders);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Calendar Integrations */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Calendar Integrations</h3>
          <p className="text-muted-foreground text-sm">
            Connect and manage your calendar providers for automatic event synchronization
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <CalendarIntegrationSection />
        </div>
      </div>

      {/* Sync Settings */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Sync Settings</h3>
          <p className="text-muted-foreground text-sm">
            Configure how extracted events are synchronized to your calendar
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">Automatic Sync</div>
              <div className="text-sm text-muted-foreground">Automatically create calendar events from extracted appointments</div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.autoSync}
              onChange={(e) => handleChange('autoSync', e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">Sync Only Confirmed Events</div>
              <div className="text-sm text-muted-foreground">Only sync events after they have been manually confirmed</div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.syncOnlyConfirmed}
              onChange={(e) => handleChange('syncOnlyConfirmed', e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">Allow Overlapping Events</div>
              <div className="text-sm text-muted-foreground">Create calendar events even if they overlap with existing ones</div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.allowOverlappingEvents}
              onChange={(e) => handleChange('allowOverlappingEvents', e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
          </label>
        </div>
      </div>

      {/* Event Creation Settings */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Event Creation Settings</h3>
          <p className="text-muted-foreground text-sm">
            Customize how calendar events are created and formatted
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="defaultDuration">Default Duration (minutes)</Label>
            <Input
              id="defaultDuration"
              type="number"
              min="15"
              max="480"
              step="15"
              value={localSettings.defaultDuration}
              onChange={(e) => handleChange('defaultDuration', parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Default duration for events when not specified in the call
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bufferTime">Buffer Time (minutes)</Label>
            <Input
              id="bufferTime"
              type="number"
              min="0"
              max="60"
              step="5"
              value={localSettings.bufferTime}
              onChange={(e) => handleChange('bufferTime', parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Time to add before and after events for travel/preparation
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventPrefix">Event Title Prefix</Label>
            <Input
              id="eventPrefix"
              value={localSettings.eventPrefix || ''}
              onChange={(e) => handleChange('eventPrefix', e.target.value)}
              placeholder="Flynn.ai: "
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Text to add at the beginning of all event titles
            </p>
          </div>

          <div className="space-y-2">
            <Label>Event Color</Label>
            <div className="flex flex-wrap gap-2">
              {eventColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleChange('eventColor', color.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    localSettings.eventColor === color.value 
                      ? 'border-foreground scale-110' 
                      : 'border-border hover:scale-105'
                  } ${color.color}`}
                  title={color.label}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Color coding for Flynn.ai events in your calendar
            </p>
          </div>
        </div>
      </div>

      {/* Conflict Resolution */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Conflict Resolution</h3>
          <p className="text-muted-foreground text-sm">
            Choose how to handle calendar conflicts when creating events
          </p>
        </div>

        <div className="space-y-3">
          {conflictResolutionOptions.map((option) => (
            <label 
              key={option.value}
              className={`flex items-start space-x-4 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/30 ${
                localSettings.conflictResolution === option.value 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border'
              }`}
            >
              <input
                type="radio"
                name="conflictResolution"
                value={option.value}
                checked={localSettings.conflictResolution === option.value}
                onChange={(e) => handleChange('conflictResolution', e.target.value)}
                className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2 mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-foreground">{option.label}</div>
                <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Event Details</h3>
          <p className="text-muted-foreground text-sm">
            Configure what information is included in calendar events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'includeCustomerInfo', label: 'Customer Information', description: 'Include customer contact details in event description' },
            { key: 'includeCallTranscript', label: 'Call Transcript', description: 'Attach call transcript to calendar event' },
            { key: 'includeLocation', label: 'Location Details', description: 'Add location/address information when available' },
            { key: 'privateEvents', label: 'Private Events', description: 'Mark all Flynn.ai events as private in your calendar' },
          ].map((item) => (
            <label key={item.key} className="flex items-start space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/20 transition-colors">
              <input
                type="checkbox"
                checked={localSettings[item.key as keyof typeof localSettings] as boolean}
                onChange={(e) => handleChange(item.key as keyof UserSettings['calendar'], e.target.checked)}
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

      {/* Reminders */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Event Reminders</h3>
          <p className="text-muted-foreground text-sm">
            Set up automatic reminders for calendar events
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">Enable Reminders</div>
              <div className="text-sm text-muted-foreground">Add reminder notifications to calendar events</div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.setReminders}
              onChange={(e) => handleChange('setReminders', e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
          </label>

          {localSettings.setReminders && (
            <div className="bg-muted/20 rounded-lg p-4 space-y-3">
              <Label className="text-sm font-medium">Reminder Times</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {reminderOptions.map((reminder) => {
                  const isSelected = (localSettings.reminderMinutes || []).includes(reminder.value);
                  return (
                    <label 
                      key={reminder.value}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors text-sm ${
                        isSelected 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleReminder(reminder.value)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                      />
                      <span>{reminder.label}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Select multiple reminder times. Events will have all selected reminders.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Timezone Settings */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Timezone Settings</h3>
          <p className="text-muted-foreground text-sm">
            Configure how timezones are handled for calendar events
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">Use Business Timezone</div>
              <div className="text-sm text-muted-foreground">Create events in your configured business timezone</div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.useBusinessTimezone}
              onChange={(e) => handleChange('useBusinessTimezone', e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">Convert to Local Time</div>
              <div className="text-sm text-muted-foreground">Automatically convert event times to your local timezone</div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.convertToLocalTime}
              onChange={(e) => handleChange('convertToLocalTime', e.target.checked)}
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