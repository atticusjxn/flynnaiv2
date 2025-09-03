'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { Switch } from '@nextui-org/switch';
import { Button } from '@nextui-org/button';
import { Chip } from '@nextui-org/chip';
import {
  PhoneIcon,
  BoltIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface AIProcessingSettings {
  aiProcessingEnabled: boolean;
  forwardingSetupComplete: boolean;
  flynnNumber: string | null;
  userPhoneNumber: string | null;
  dailyLimit: number;
  monthlyUsage: number;
}

interface AIProcessingStats {
  totalCallsLast30Days: number;
  businessCalls: number;
  personalCalls: number;
  eventsExtracted: number;
  processingSuccessRate: number;
  averageEventsPerCall: number;
}

export default function AIProcessingToggle() {
  const [settings, setSettings] = useState<AIProcessingSettings | null>(null);
  const [stats, setStats] = useState<AIProcessingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/user/ai-processing-settings');
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
      } else {
        setError('Failed to load AI settings');
      }
    } catch (err) {
      setError('Connection error');
      console.error('Settings load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/user/ai-processing-settings/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Stats load error:', err);
    }
  };

  const toggleAIProcessing = async (enabled: boolean) => {
    if (!settings) return;

    setIsUpdating(true);
    setError('');

    try {
      const response = await fetch('/api/user/ai-processing-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiProcessingEnabled: enabled }),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);

        // Show feedback
        const message = enabled
          ? 'AI call processing enabled! All business calls will now be automatically processed.'
          : 'AI call processing disabled. Calls will pass through without AI analysis.';

        console.log(message);
      } else {
        setError(data.error || 'Failed to update settings');
      }
    } catch (err) {
      setError('Connection error');
      console.error('Toggle error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardBody className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardBody>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card className="w-full border-danger-200 bg-danger-50">
        <CardBody className="text-center py-8">
          <ExclamationTriangleIcon className="w-12 h-12 text-danger mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-danger mb-2">
            Setup Required
          </h3>
          <p className="text-danger-600 mb-4">
            Please complete your call forwarding setup to enable AI processing.
          </p>
          <Button color="danger" variant="bordered" href="/onboarding?step=2">
            Complete Setup
          </Button>
        </CardBody>
      </Card>
    );
  }

  const isSetupComplete =
    settings.forwardingSetupComplete && settings.flynnNumber;
  const usagePercentage =
    (settings.monthlyUsage / (settings.dailyLimit * 30)) * 100;

  return (
    <div className="space-y-6">
      {/* Main AI Processing Control */}
      <Card
        className={`w-full ${isSetupComplete ? 'border-success-200' : 'border-warning-200'}`}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${
                settings.aiProcessingEnabled
                  ? 'bg-success-100 text-success-700'
                  : 'bg-gray-100 text-gray-500'
              }
            `}
            >
              <BoltIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                AI Call Processing
              </h3>
              <p className="text-sm text-muted-foreground">
                Automatically process all business calls for appointments and
                quotes
              </p>
            </div>
          </div>

          <Switch
            isSelected={settings.aiProcessingEnabled}
            onValueChange={toggleAIProcessing}
            isDisabled={!isSetupComplete || isUpdating}
            size="lg"
            color="success"
          />
        </CardHeader>

        <CardBody className="pt-0">
          {/* Status Information */}
          <div className="space-y-4">
            {/* Setup Status */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Call Forwarding</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.flynnNumber || 'Not configured'}
                  </p>
                </div>
              </div>
              <Chip
                color={isSetupComplete ? 'success' : 'warning'}
                variant="flat"
                size="sm"
                startContent={
                  isSetupComplete ? (
                    <CheckCircleIcon className="w-4 h-4" />
                  ) : (
                    <ExclamationTriangleIcon className="w-4 h-4" />
                  )
                }
              >
                {isSetupComplete ? 'Active' : 'Setup Required'}
              </Chip>
            </div>

            {/* Current Status */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <BoltIcon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">AI Processing</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.aiProcessingEnabled
                      ? 'All business calls being processed'
                      : 'Processing paused - calls pass through normally'}
                  </p>
                </div>
              </div>
              <Chip
                color={settings.aiProcessingEnabled ? 'success' : 'default'}
                variant="flat"
                size="sm"
              >
                {settings.aiProcessingEnabled ? 'ON' : 'OFF'}
              </Chip>
            </div>

            {/* Usage Information */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <ChartBarIcon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Monthly Usage</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.monthlyUsage} of {settings.dailyLimit * 30} calls
                    processed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {usagePercentage.toFixed(0)}%
                </p>
                <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, usagePercentage)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}

          {/* How It Works */}
          <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-primary mb-2">How It Works</h4>
                <ul className="text-sm text-primary-700 space-y-1">
                  <li>
                    • All calls to your Flynn.ai number are forwarded to your
                    phone
                  </li>
                  <li>
                    • When AI processing is ON, business calls are automatically
                    recorded and analyzed
                  </li>
                  <li>
                    • You get SMS summaries and calendar events within 2 minutes
                  </li>
                  <li>• Personal calls are filtered out and not processed</li>
                  <li>• Turn off anytime to pause AI processing</li>
                </ul>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Processing Stats */}
      {stats && stats.totalCallsLast30Days > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">
              Last 30 Days Performance
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {stats.totalCallsLast30Days}
                </p>
                <p className="text-sm text-muted-foreground">Total Calls</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">
                  {stats.businessCalls}
                </p>
                <p className="text-sm text-muted-foreground">Business Calls</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">
                  {stats.eventsExtracted}
                </p>
                <p className="text-sm text-muted-foreground">Events Created</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">
                  {stats.processingSuccessRate.toFixed(0)}%
                </p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
