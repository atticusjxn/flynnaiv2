'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { UserSettings } from '@/types/settings.types';

interface AISettingsProps {
  settings: UserSettings;
  onUpdate: (section: 'ai', updates: Partial<UserSettings['ai']>) => void;
  hasChanges: boolean;
  onSave: () => void;
  isSaving: boolean;
}

const processingModes = [
  { 
    value: 'speed', 
    label: 'Speed Optimized', 
    description: 'Fastest processing with good accuracy. Best for high-volume operations.',
    features: ['< 1 minute processing', 'Good accuracy (~85%)', 'Lower cost per call']
  },
  { 
    value: 'balanced', 
    label: 'Balanced (Recommended)', 
    description: 'Optimal balance of speed and accuracy for most business needs.',
    features: ['< 2 minute processing', 'High accuracy (~90%)', 'Standard cost per call']
  },
  { 
    value: 'accuracy', 
    label: 'Accuracy Optimized', 
    description: 'Maximum accuracy with detailed analysis. Best for critical appointments.',
    features: ['2-5 minute processing', 'Highest accuracy (~95%)', 'Premium cost per call']
  },
];

const languages = [
  { value: 'english', label: 'English', available: true },
  { value: 'spanish', label: 'Spanish', available: false },
  { value: 'french', label: 'French', available: false },
  { value: 'auto-detect', label: 'Auto-detect', available: true },
];

const transcriptionQualities = [
  { 
    value: 'standard', 
    label: 'Standard Quality', 
    description: 'Good quality for clear phone calls with minimal background noise'
  },
  { 
    value: 'enhanced', 
    label: 'Enhanced Quality', 
    description: 'Better handling of accents, background noise, and poor call quality'
  },
];

export default function AISettings({ 
  settings, 
  onUpdate, 
  hasChanges, 
  onSave, 
  isSaving 
}: AISettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings.ai);
  const [customKeyword, setCustomKeyword] = useState('');

  const handleChange = (field: keyof UserSettings['ai'], value: any) => {
    const updates = { [field]: value };
    setLocalSettings(prev => ({ ...prev, ...updates }));
    onUpdate('ai', updates);
  };

  const addCustomKeyword = () => {
    if (!customKeyword.trim()) return;
    
    const keywords = [...(localSettings.customKeywords || []), customKeyword.trim()];
    setCustomKeyword('');
    handleChange('customKeywords', keywords);
  };

  const removeCustomKeyword = (index: number) => {
    const keywords = localSettings.customKeywords?.filter((_, i) => i !== index) || [];
    handleChange('customKeywords', keywords);
  };

  const formatThreshold = (value: number) => {
    return Math.round(value * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Processing Mode */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">AI Processing Mode</h3>
          <p className="text-muted-foreground text-sm">
            Choose how Flynn.ai processes your calls based on your speed and accuracy needs
          </p>
        </div>

        <div className="space-y-4">
          {processingModes.map((mode) => (
            <label 
              key={mode.value}
              className={`block p-6 border rounded-lg cursor-pointer transition-colors hover:bg-muted/30 ${
                localSettings.processingMode === mode.value 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border'
              }`}
            >
              <div className="flex items-start space-x-4">
                <input
                  type="radio"
                  name="processingMode"
                  value={mode.value}
                  checked={localSettings.processingMode === mode.value}
                  onChange={(e) => handleChange('processingMode', e.target.value)}
                  className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-foreground">{mode.label}</h4>
                    {mode.value === 'balanced' && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{mode.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {mode.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Confidence Thresholds */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Confidence Thresholds</h3>
          <p className="text-muted-foreground text-sm">
            Set AI confidence levels for automatic actions and human review requirements
          </p>
        </div>

        <div className="space-y-6">
          {/* Auto-confirm Threshold */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Auto-confirm Threshold</Label>
              <p className="text-sm text-muted-foreground">
                Automatically confirm events when AI confidence is above this level
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Conservative</span>
                <span className="font-medium text-foreground">
                  {formatThreshold(localSettings.autoConfirmThreshold)}% Confidence
                </span>
                <span className="text-sm text-muted-foreground">Aggressive</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={localSettings.autoConfirmThreshold}
                onChange={(e) => handleChange('autoConfirmThreshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50%</span>
                <span>70%</span>
                <span>85%</span>
                <span>95%</span>
              </div>
            </div>
          </div>

          {/* Human Review Threshold */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Human Review Threshold</Label>
              <p className="text-sm text-muted-foreground">
                Flag events for manual review when AI confidence is below this level
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Strict</span>
                <span className="font-medium text-foreground">
                  {formatThreshold(localSettings.humanReviewThreshold)}% Confidence
                </span>
                <span className="text-sm text-muted-foreground">Lenient</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="0.8"
                step="0.05"
                value={localSettings.humanReviewThreshold}
                onChange={(e) => handleChange('humanReviewThreshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>30%</span>
                <span>50%</span>
                <span>65%</span>
                <span>80%</span>
              </div>
            </div>
          </div>

          {/* Threshold Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 text-blue-600 mt-0.5">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm">
                <div className="font-medium text-blue-800 mb-1">How Confidence Thresholds Work</div>
                <div className="text-blue-700">
                  <p className="mb-2">
                    <strong>Above Auto-confirm:</strong> Events are automatically confirmed and added to your calendar
                  </p>
                  <p className="mb-2">
                    <strong>Between thresholds:</strong> Events are extracted but require your manual review
                  </p>
                  <p>
                    <strong>Below Review threshold:</strong> Events are flagged for attention and may need significant editing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Extraction Settings */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Event Extraction Settings</h3>
          <p className="text-muted-foreground text-sm">
            Configure how AI extracts appointments and events from call conversations
          </p>
        </div>

        <div className="space-y-4">
          {[
            { 
              key: 'extractMultipleEvents', 
              label: 'Extract Multiple Events', 
              description: 'Allow AI to find multiple appointments in a single call' 
            },
            { 
              key: 'requireExplicitTime', 
              label: 'Require Explicit Time', 
              description: 'Only extract events when specific times are mentioned (e.g., "2 PM tomorrow")' 
            },
            { 
              key: 'requireLocation', 
              label: 'Require Location Details', 
              description: 'Only extract events when location or address information is provided' 
            },
            { 
              key: 'industryOptimizations', 
              label: 'Industry Optimizations', 
              description: 'Use industry-specific processing rules for better accuracy' 
            },
          ].map((setting) => (
            <label key={setting.key} className="flex items-start space-x-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/20 transition-colors">
              <input
                type="checkbox"
                checked={localSettings[setting.key as keyof typeof localSettings] as boolean}
                onChange={(e) => handleChange(setting.key as keyof UserSettings['ai'], e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-foreground">{setting.label}</div>
                <div className="text-sm text-muted-foreground mt-1">{setting.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Custom Keywords */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Custom Keywords</h3>
          <p className="text-muted-foreground text-sm">
            Add industry-specific or business-specific keywords to improve AI recognition
          </p>
        </div>

        <div className="space-y-4">
          {/* Add Keyword Input */}
          <div className="flex space-x-2">
            <Input
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              placeholder="Enter a custom keyword or phrase"
              onKeyPress={(e) => e.key === 'Enter' && addCustomKeyword()}
              className="flex-1"
            />
            <Button
              onClick={addCustomKeyword}
              disabled={!customKeyword.trim()}
              variant="secondary"
            >
              Add
            </Button>
          </div>

          {/* Current Keywords */}
          {localSettings.customKeywords && localSettings.customKeywords.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Custom Keywords</Label>
              <div className="flex flex-wrap gap-2">
                {localSettings.customKeywords.map((keyword, index) => (
                  <div 
                    key={index}
                    className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    <span>{keyword}</span>
                    <button
                      onClick={() => removeCustomKeyword(index)}
                      className="text-primary/60 hover:text-primary focus:outline-none"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-3">
            <strong>Examples:</strong> "site visit", "property inspection", "emergency repair", "follow-up appointment"
          </div>
        </div>
      </div>

      {/* Automatic Actions */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Automatic Actions</h3>
          <p className="text-muted-foreground text-sm">
            Configure what actions Flynn.ai can take automatically based on extracted events
          </p>
        </div>

        <div className="space-y-4">
          {[
            { 
              key: 'autoConfirmHighConfidence', 
              label: 'Auto-confirm High Confidence Events', 
              description: 'Automatically confirm events that exceed the confidence threshold',
              warning: true
            },
            { 
              key: 'autoCreateCalendarEvents', 
              label: 'Auto-create Calendar Events', 
              description: 'Automatically add confirmed events to your connected calendars' 
            },
            { 
              key: 'autoSendCustomerEmails', 
              label: 'Auto-send Customer Emails', 
              description: 'Automatically send confirmation emails to customers (when email available)',
              warning: true
            },
          ].map((setting) => (
            <label 
              key={setting.key} 
              className={`flex items-start space-x-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/20 transition-colors ${
                setting.warning ? 'border-amber-200 bg-amber-50/30' : 'border-border'
              }`}
            >
              <input
                type="checkbox"
                checked={localSettings[setting.key as keyof typeof localSettings] as boolean}
                onChange={(e) => handleChange(setting.key as keyof UserSettings['ai'], e.target.checked)}
                className={`w-4 h-4 border-border rounded focus:ring-2 mt-1 ${
                  setting.warning ? 'text-amber-600 focus:ring-amber-500' : 'text-primary focus:ring-primary'
                }`}
              />
              <div className="flex-1">
                <div className={`font-medium flex items-center space-x-2 ${
                  setting.warning ? 'text-amber-800' : 'text-foreground'
                }`}>
                  <span>{setting.label}</span>
                  {setting.warning && (
                    <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className={`text-sm mt-1 ${
                  setting.warning ? 'text-amber-700' : 'text-muted-foreground'
                }`}>
                  {setting.description}
                </div>
              </div>
            </label>
          ))}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 text-amber-600 mt-0.5">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm">
                <div className="font-medium text-amber-800 mb-1">Automatic Actions Warning</div>
                <div className="text-amber-700">
                  Automatic actions can save time but may occasionally act on incorrectly interpreted information. 
                  Start with conservative settings and monitor results before enabling aggressive automation.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Language & Transcription */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Language & Transcription</h3>
          <p className="text-muted-foreground text-sm">
            Configure language processing and transcription quality settings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language Selection */}
          <div className="space-y-3">
            <Label>Primary Language</Label>
            <div className="space-y-2">
              {languages.map((lang) => (
                <label 
                  key={lang.value}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    !lang.available 
                      ? 'opacity-50 cursor-not-allowed bg-muted/20' 
                      : localSettings.language === lang.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="language"
                      value={lang.value}
                      checked={localSettings.language === lang.value}
                      onChange={(e) => handleChange('language', e.target.value)}
                      disabled={!lang.available}
                      className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                    />
                    <span className="font-medium text-foreground">{lang.label}</span>
                  </div>
                  {!lang.available && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Transcription Quality */}
          <div className="space-y-3">
            <Label>Transcription Quality</Label>
            <div className="space-y-3">
              {transcriptionQualities.map((quality) => (
                <label 
                  key={quality.value}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/30 ${
                    localSettings.transcriptionQuality === quality.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="transcriptionQuality"
                      value={quality.value}
                      checked={localSettings.transcriptionQuality === quality.value}
                      onChange={(e) => handleChange('transcriptionQuality', e.target.value)}
                      className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2 mt-1"
                    />
                    <div>
                      <div className="font-medium text-foreground">{quality.label}</div>
                      <div className="text-sm text-muted-foreground mt-1">{quality.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Retention */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Data Retention</h3>
          <p className="text-muted-foreground text-sm">
            Configure how long Flynn.ai keeps your call recordings and transcriptions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recording Retention */}
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">Keep Call Recordings</div>
                <div className="text-sm text-muted-foreground">Store audio recordings for playback and analysis</div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.keepRecordings}
                onChange={(e) => handleChange('keepRecordings', e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
              />
            </label>

            {localSettings.keepRecordings && (
              <div className="space-y-2">
                <Label htmlFor="recordingRetention">Recording Retention (days)</Label>
                <Input
                  id="recordingRetention"
                  type="number"
                  min="7"
                  max="365"
                  value={localSettings.recordingRetentionDays}
                  onChange={(e) => handleChange('recordingRetentionDays', parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Recordings will be automatically deleted after this period
                </p>
              </div>
            )}
          </div>

          {/* Transcript Retention */}
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">Keep Call Transcripts</div>
                <div className="text-sm text-muted-foreground">Store text transcriptions for searching and analysis</div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.keepTranscripts}
                onChange={(e) => handleChange('keepTranscripts', e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
              />
            </label>

            {localSettings.keepTranscripts && (
              <div className="space-y-2">
                <Label htmlFor="transcriptRetention">Transcript Retention (days)</Label>
                <Input
                  id="transcriptRetention"
                  type="number"
                  min="30"
                  max="1095"
                  value={localSettings.transcriptRetentionDays}
                  onChange={(e) => handleChange('transcriptRetentionDays', parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Transcripts will be automatically deleted after this period
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-blue-600 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-1">Data Retention Policy</div>
              <div className="text-blue-700">
                Shorter retention periods save storage costs but limit your ability to review historical calls. 
                Consider your business needs, compliance requirements, and storage budget when setting retention periods.
              </div>
            </div>
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