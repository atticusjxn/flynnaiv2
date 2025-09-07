'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@nextui-org/card';
import { Button } from '@nextui-org/button';
import { Progress } from '@nextui-org/progress';
import {
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import IndustrySelectionWizard from './IndustrySelectionWizard';
import PhoneSetupGuide from './PhoneSetupGuide';
import { useAuthContext } from '@/components/MinimalAuthProvider';

interface OnboardingFlowProps {
  onComplete: () => void;
  initialStep?: number;
}

interface OnboardingData {
  industry?: string;
  phoneConfig?: {
    phoneNumber: string;
    setupMethod: 'new' | 'existing';
    webhookUrl?: string;
    verified: boolean;
  };
  flynnNumber?: string;
  forwardingCode?: string;
  userPhoneNumber?: string;
  forwardingSetupComplete?: boolean;
  aiConfigured?: boolean;
  aiSettings?: {
    emailSummaries: boolean;
    smsNotifications: boolean;
    calendarSync: boolean;
    aiProcessingEnabled: boolean;
  };
  calendarConnected?: boolean;
  emailPreferences?: {
    enableEmailSummaries: boolean;
    enableCustomerNotifications: boolean;
  };
  completed?: boolean;
}

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'Choose Industry',
    description: 'Select your business type for AI optimization',
  },
  {
    id: 2,
    title: 'Get Your Number',
    description: 'Get your Flynn.ai forwarding number',
  },
  {
    id: 3,
    title: 'Setup Forwarding',
    description: '10-second call forwarding setup',
  },
  {
    id: 4,
    title: 'Configure AI',
    description: 'Set up AI processing preferences',
  },
  { id: 5, title: 'Complete Setup', description: 'Your AI assistant is ready' },
];

export default function OnboardingFlow({
  onComplete,
  initialStep = 1,
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthContext();

  const progress = ((currentStep - 1) / (ONBOARDING_STEPS.length - 1)) * 100;

  useEffect(() => {
    // Load any existing onboarding progress
    loadOnboardingProgress();
  }, []);

  const loadOnboardingProgress = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/user/onboarding-progress');
      if (response.ok) {
        const data = await response.json();
        setOnboardingData(data.progress || {});

        // Resume from the appropriate step
        if (data.progress?.completed) {
          onComplete();
        } else if (data.progress?.aiConfigured) {
          setCurrentStep(5);
        } else if (data.progress?.forwardingSetupComplete) {
          setCurrentStep(4);
        } else if (data.progress?.flynnNumber) {
          setCurrentStep(3);
        } else if (data.progress?.industry) {
          setCurrentStep(2);
        }
      }
    } catch (err) {
      console.error('Failed to load onboarding progress:', err);
    }
  };

  const saveOnboardingProgress = async (data: Partial<OnboardingData>) => {
    if (!user) return;

    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);

    try {
      await fetch('/api/user/onboarding-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: updatedData }),
      });
    } catch (err) {
      console.error('Failed to save onboarding progress:', err);
    }
  };

  const handleIndustrySelection = async (industry: string) => {
    await saveOnboardingProgress({ industry });
    setCurrentStep(2);
  };

  const handleGetNumber = async (
    phoneNumber: string,
    preferredAreaCode?: string
  ) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/phone/setup-forwarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPhoneNumber: phoneNumber,
          preferredAreaCode: preferredAreaCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await saveOnboardingProgress({
          flynnNumber: data.flynnNumber,
          forwardingCode: data.forwardingCode,
          userPhoneNumber: phoneNumber,
        });
        setCurrentStep(2);
      } else {
        setError(data.error || 'Failed to get Flynn.ai number');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForwardingComplete = async () => {
    await saveOnboardingProgress({ forwardingSetupComplete: true });
    setCurrentStep(4);
  };

  const handleAIConfiguration = async (config: any) => {
    await saveOnboardingProgress({
      aiConfigured: true,
      aiSettings: config,
    });
    setCurrentStep(5);
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Mark onboarding as complete and initialize user trial
      await Promise.all([
        saveOnboardingProgress({ completed: true }),
        fetch('/api/user/initialize-trial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            email: user?.email,
          }),
        }),
      ]);

      // Send welcome sequence emails
      await fetch('/api/emails/send-welcome-sequence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          industry: onboardingData.industry,
          phoneNumber: onboardingData.phoneConfig?.phoneNumber,
        }),
      });

      onComplete();
    } catch (err) {
      setError('Failed to complete onboarding. Please try again.');
      console.error('Onboarding completion failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipStep = () => {
    // Skip logic for current step if needed
    setCurrentStep(currentStep + 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <IndustrySelectionStep
            onComplete={handleIndustrySelection}
            onBack={handleStepBack}
            selectedIndustry={onboardingData.industry}
            isLoading={isLoading}
            error={error}
          />
        );

      case 2:
        return (
          <GetNumberStep
            onComplete={handleGetNumber}
            onBack={handleStepBack}
            isLoading={isLoading}
            error={error}
          />
        );

      case 3:
        return (
          <ForwardingSetupStep
            onComplete={handleForwardingComplete}
            onBack={handleStepBack}
            flynnNumber={onboardingData.flynnNumber}
            forwardingCode={onboardingData.forwardingCode}
            userPhoneNumber={onboardingData.userPhoneNumber}
          />
        );

      case 4:
        return (
          <AIConfigurationStep
            onComplete={handleAIConfiguration}
            onBack={handleStepBack}
            industry={onboardingData.industry}
            isLoading={isLoading}
            error={error}
          />
        );

      case 5:
        return (
          <SetupCompleteStep
            onComplete={handleCompleteOnboarding}
            onBack={handleStepBack}
            data={onboardingData}
            isLoading={isLoading}
            error={error}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Premium background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/[0.03] via-transparent to-purple-600/[0.03]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full blur-3xl" />

      <div className="container max-w-6xl mx-auto px-4 py-8 relative">
        {/* Premium Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50 rounded-full mb-6 backdrop-blur-sm">
            <SparklesIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Premium AI-Powered Setup
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent mb-4">
            Welcome to Flynn.ai
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Transform your business calls into organized calendar events with
            enterprise-grade AI
          </p>
        </div>

        {/* Premium Progress Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Setup Progress
              </h2>
              <p className="text-sm text-slate-600">
                Step {currentStep} of {ONBOARDING_STEPS.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(progress)}%
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">
                Complete
              </div>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="relative mb-8">
            <div className="h-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-lg relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
                <div className="absolute right-0 top-0 w-1 h-full bg-white/30 rounded-r-full" />
              </div>
            </div>
            {progress > 0 && (
              <div
                className="absolute top-0 h-2 w-4 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full transition-all duration-700 ease-out"
                style={{ left: `calc(${Math.max(progress - 8, 0)}% + 0px)` }}
              />
            )}
          </div>

          {/* Premium Step Indicators */}
          <div className="grid grid-cols-5 gap-2 md:gap-4">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={step.id} className="relative">
                <div className="text-center">
                  <div className="relative inline-block mb-3">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold 
                        transition-all duration-500 ease-out relative overflow-hidden
                        ${
                          currentStep > step.id
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-105'
                            : currentStep === step.id
                              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-110 ring-4 ring-blue-500/20'
                              : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 shadow-sm'
                        }
                      `}
                    >
                      {currentStep > step.id ? (
                        <CheckIcon className="w-5 h-5" />
                      ) : currentStep === step.id ? (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      ) : (
                        step.id
                      )}

                      {/* Animated background for active step */}
                      {currentStep === step.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full animate-pulse" />
                      )}
                    </div>

                    {/* Connection line */}
                    {index < ONBOARDING_STEPS.length - 1 && (
                      <div className="absolute top-6 left-12 w-full h-0.5 -z-10">
                        <div
                          className={`h-full transition-all duration-700 ${
                            currentStep > step.id
                              ? 'bg-gradient-to-r from-green-500 to-blue-500'
                              : 'bg-slate-200'
                          }`}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`text-sm font-medium transition-colors duration-300 ${
                        currentStep >= step.id
                          ? 'text-slate-800'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div
                      className={`text-xs transition-colors duration-300 ${
                        currentStep >= step.id
                          ? 'text-slate-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Step Content Container */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/40 to-white/60 rounded-3xl shadow-2xl shadow-slate-900/[0.03] backdrop-blur-sm border border-white/50" />
          <div className="relative p-8 md:p-12">
            <div
              key={currentStep}
              className="animate-in slide-in-from-right-8 fade-in duration-500 ease-out"
            >
              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual step components
function GetNumberStep({ onComplete, onBack, isLoading, error }: any) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferredAreaCode, setPreferredAreaCode] = useState('');

  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 7)
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      onComplete(cleaned, preferredAreaCode || undefined);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📞</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Get Your Flynn.ai Number
        </h2>
        <p className="text-lg text-muted-foreground">
          We'll get you an Australian phone number that forwards all calls to
          your existing phone with AI processing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Your Current Phone Number
          </label>
          <input
            type="text"
            placeholder="0400 123 456"
            value={phoneNumber}
            onChange={handlePhoneChange}
            className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-lg text-center"
            required
            maxLength={12}
          />
          <p className="text-xs text-muted-foreground mt-1">
            This is the phone you'll receive forwarded calls on
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Preferred Area Code (Optional)
          </label>
          <input
            type="text"
            placeholder="02, 03, 07, 08..."
            value={preferredAreaCode}
            onChange={(e) =>
              setPreferredAreaCode(
                e.target.value.replace(/\D/g, '').slice(0, 2)
              )
            }
            className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-center"
            maxLength={2}
          />
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="light" onPress={onBack} isDisabled={isLoading}>
            Back
          </Button>

          <Button
            type="submit"
            color="primary"
            size="lg"
            isLoading={isLoading}
            isDisabled={phoneNumber.replace(/\D/g, '').length < 10}
          >
            {isLoading ? 'Getting Your Number...' : 'Get My Flynn.ai Number'}
          </Button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <h4 className="font-medium text-primary mb-2">What Happens Next?</h4>
        <ul className="text-sm text-primary-700 space-y-1 text-left">
          <li>✓ We'll get you an Australian phone number instantly</li>
          <li>✓ You'll receive SMS instructions for 10-second setup</li>
          <li>✓ All your business calls will be automatically processed</li>
          <li>✓ You keep using your existing phone normally</li>
        </ul>
      </div>
    </div>
  );
}

function ForwardingSetupStep({
  onComplete,
  onBack,
  flynnNumber,
  forwardingCode,
  userPhoneNumber,
}: any) {
  const [setupComplete, setSetupComplete] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚡</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4">
          10-Second Setup
        </h2>
        <p className="text-lg text-muted-foreground">
          Your Flynn.ai number is ready! Just set up call forwarding with one
          quick step.
        </p>
      </div>

      <div className="bg-gradient-to-r from-success/10 to-primary/10 border border-success/20 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Your Flynn.ai Number
        </h3>
        <div className="text-3xl font-mono font-bold text-primary mb-2">
          {flynnNumber}
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          This number forwards to: {userPhoneNumber}
        </p>

        <div className="bg-white rounded-lg p-6 border-2 border-primary/20">
          <h4 className="font-semibold text-foreground mb-3">
            Setup Instructions
          </h4>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Open your phone's dialer
                </p>
                <p className="text-sm text-muted-foreground">
                  Use your regular phone app
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-foreground">Dial this code</p>
                <div className="bg-gray-100 rounded-lg p-3 mt-2 font-mono text-lg text-center font-bold">
                  {forwardingCode}
                </div>
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => navigator.clipboard.writeText(forwardingCode)}
                  className="mt-2"
                >
                  Copy Code
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-foreground">Press call</p>
                <p className="text-sm text-muted-foreground">
                  You'll hear a confirmation beep
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <input
          type="checkbox"
          id="setup-complete"
          checked={setupComplete}
          onChange={(e) => setSetupComplete(e.target.checked)}
          className="w-5 h-5"
        />
        <label
          htmlFor="setup-complete"
          className="text-sm font-medium text-foreground"
        >
          I've completed the call forwarding setup
        </label>
      </div>

      <div className="flex justify-between">
        <Button variant="light" onPress={onBack}>
          Back
        </Button>

        <Button
          color="primary"
          size="lg"
          onPress={onComplete}
          isDisabled={!setupComplete}
        >
          Continue - Start Processing
        </Button>
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-700">
          <strong>Note:</strong> You can turn AI processing on/off anytime from
          your dashboard. Calls will always reach you normally - AI just listens
          and creates summaries when enabled.
        </p>
      </div>
    </div>
  );
}

function ProcessingReadyStep({
  onComplete,
  onBack,
  data,
  isLoading,
  error,
}: any) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckIcon className="w-10 h-10 text-success-600" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4">
          🎉 Flynn.ai is Ready!
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          Your AI assistant is now active and will process all your business
          calls automatically
        </p>
      </div>

      <div className="bg-gradient-to-r from-success/10 to-primary/10 border border-success/20 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          What Happens Now
        </h3>

        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-success text-white rounded-full flex items-center justify-center text-sm">
              ✓
            </div>
            <div>
              <p className="font-medium text-foreground">
                All calls are automatically processed
              </p>
              <p className="text-sm text-muted-foreground">
                Business calls get AI analysis, personal calls are filtered out
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-success text-white rounded-full flex items-center justify-center text-sm">
              ✓
            </div>
            <div>
              <p className="font-medium text-foreground">
                SMS summaries after each call
              </p>
              <p className="text-sm text-muted-foreground">
                Get instant summaries with appointment details
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-success text-white rounded-full flex items-center justify-center text-sm">
              ✓
            </div>
            <div>
              <p className="font-medium text-foreground">
                Calendar events created automatically
              </p>
              <p className="text-sm text-muted-foreground">
                Never miss another appointment or quote
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-primary mb-2">Your Flynn.ai Setup</h4>
        <div className="space-y-2 text-sm text-left">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Flynn.ai Number:</span>
            <span className="font-mono font-medium">{data.flynnNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Phone:</span>
            <span className="font-mono font-medium">
              {data.userPhoneNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">AI Processing:</span>
            <span className="font-medium text-success">Active</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <XMarkIcon className="w-5 h-5 text-destructive" />
            <span className="text-destructive text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="light" onPress={onBack} isDisabled={isLoading}>
          Back
        </Button>

        <Button
          color="primary"
          size="lg"
          onPress={onComplete}
          isLoading={isLoading}
        >
          {isLoading ? 'Finalizing setup...' : 'Open Dashboard'}
        </Button>
      </div>
    </div>
  );
}

function CalendarSetupStep({ onComplete, onBack, onSkip, isConnected }: any) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  const handleGoogleConnect = async () => {
    setIsConnecting(true);
    setConnectionType('google');
    // Simulate Google Calendar connection
    await new Promise((resolve) => setTimeout(resolve, 2000));
    onComplete(true);
    setIsConnecting(false);
  };

  const handleOutlookConnect = async () => {
    setIsConnecting(true);
    setConnectionType('outlook');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    onComplete(true);
    setIsConnecting(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 animate-pulse" />
            <span className="text-4xl relative z-10">📅</span>
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
          Connect Your Calendar
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Seamlessly sync AI-extracted appointments directly to your preferred
          calendar platform
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Google Calendar Option */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl transition-all duration-300 group-hover:from-blue-500/15 group-hover:to-blue-600/10" />
          <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg shadow-blue-500/5 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/10 group-hover:border-blue-200/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl text-white">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">
                  Google Calendar
                </h3>
                <p className="text-sm text-slate-600">Most popular choice</p>
              </div>
            </div>

            <div className="space-y-2 mb-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-500" />
                <span>Real-time sync</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-500" />
                <span>Mobile integration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-500" />
                <span>Team sharing</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
              isLoading={isConnecting && connectionType === 'google'}
              onPress={handleGoogleConnect}
              isDisabled={isConnecting}
            >
              {isConnecting && connectionType === 'google'
                ? 'Connecting...'
                : 'Connect Google Calendar'}
            </Button>
          </div>
        </div>

        {/* Outlook Calendar Option */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-2xl transition-all duration-300 group-hover:from-purple-500/15 group-hover:to-purple-600/10" />
          <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg shadow-purple-500/5 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/10 group-hover:border-purple-200/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl text-white">📧</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">
                  Outlook Calendar
                </h3>
                <p className="text-sm text-slate-600">Enterprise favorite</p>
              </div>
            </div>

            <div className="space-y-2 mb-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-500" />
                <span>Office 365 sync</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-500" />
                <span>Enterprise security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-500" />
                <span>Teams integration</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
              isLoading={isConnecting && connectionType === 'outlook'}
              onPress={handleOutlookConnect}
              isDisabled={isConnecting}
            >
              {isConnecting && connectionType === 'outlook'
                ? 'Connecting...'
                : 'Connect Outlook Calendar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Skip Option */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-600 mb-3">
            Not ready to connect? No problem - you can always add calendar
            integration later in your settings.
          </p>
          <Button
            variant="light"
            onPress={onSkip}
            className="text-slate-600 hover:text-slate-800"
          >
            Skip Calendar Setup
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-200">
        <Button
          variant="light"
          onPress={onBack}
          className="text-slate-600 hover:text-slate-800"
          isDisabled={isConnecting}
        >
          ← Back
        </Button>

        <div className="text-xs text-slate-500">
          Calendar setup • Step 3 of 5
        </div>
      </div>
    </div>
  );
}

function EmailPreferencesStep({
  onComplete,
  onBack,
  onSkip,
  preferences,
}: any) {
  const [emailSummaries, setEmailSummaries] = useState(
    preferences?.enableEmailSummaries ?? true
  );
  const [customerNotifications, setCustomerNotifications] = useState(
    preferences?.enableCustomerNotifications ?? false
  );

  const handleContinue = () => {
    onComplete({
      enableEmailSummaries: emailSummaries,
      enableCustomerNotifications: customerNotifications,
    });
  };

  const PreferenceToggle = ({
    checked,
    onChange,
    title,
    description,
    icon,
    color = 'blue',
    recommended = false,
  }: any) => (
    <div className="group relative">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          color === 'blue'
            ? 'from-blue-500/5 to-blue-600/5'
            : 'from-purple-500/5 to-purple-600/5'
        } rounded-xl transition-all duration-300 ${
          checked
            ? `${color === 'blue' ? 'from-blue-500/10 to-blue-600/10' : 'from-purple-500/10 to-purple-600/10'}`
            : 'group-hover:from-slate-500/5 group-hover:to-slate-600/5'
        }`}
      />

      <div
        className={`relative bg-white/60 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 ${
          checked
            ? `${color === 'blue' ? 'border-blue-200 shadow-lg shadow-blue-500/10' : 'border-purple-200 shadow-lg shadow-purple-500/10'}`
            : 'border-slate-200 shadow-sm group-hover:border-slate-300 group-hover:shadow-md'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                checked
                  ? `${color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25' : 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25'}`
                  : 'bg-gradient-to-br from-slate-100 to-slate-200'
              }`}
            >
              <span
                className={`text-xl ${checked ? 'text-white' : 'text-slate-600'}`}
              >
                {icon}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4
                  className={`font-semibold transition-colors duration-300 ${
                    checked ? 'text-slate-800' : 'text-slate-700'
                  }`}
                >
                  {title}
                </h4>
                {recommended && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-full text-xs font-medium text-green-700">
                    <SparklesIcon className="w-3 h-3" />
                    Recommended
                  </span>
                )}
              </div>
              <p
                className={`text-sm leading-relaxed transition-colors duration-300 ${
                  checked ? 'text-slate-600' : 'text-slate-500'
                }`}
              >
                {description}
              </p>
            </div>
          </div>

          {/* Custom Toggle Switch */}
          <div className="flex items-center">
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                checked
                  ? `${color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600 focus:ring-blue-500' : 'bg-gradient-to-r from-purple-500 to-purple-600 focus:ring-purple-500'}`
                  : 'bg-slate-200 focus:ring-slate-500'
              }`}
              onClick={() => onChange(!checked)}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  checked ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Feature Preview */}
        {checked && (
          <div className="mt-4 pt-4 border-t border-slate-200/60">
            <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">
              Preview:
            </div>
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-lg p-3 text-xs text-slate-600">
              {title === 'Call Summary Emails'
                ? "📧 Professional email: 'Service call scheduled for John Smith at 123 Main St, tomorrow 2 PM - Plumbing repair needed'"
                : "📱 SMS to customer: 'Your appointment with Flynn Plumbing is confirmed for tomorrow at 2 PM. Reply CANCEL to reschedule.'"}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 animate-pulse" />
            <span className="text-4xl relative z-10">📧</span>
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
          Email Preferences
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Configure how Flynn.ai communicates with you and your customers
        </p>
      </div>

      <div className="space-y-6 mb-12">
        <PreferenceToggle
          checked={emailSummaries}
          onChange={setEmailSummaries}
          title="Call Summary Emails"
          description="Receive professional email summaries within 2 minutes of each processed call. Perfect for staying organized and following up with customers."
          icon="📧"
          color="blue"
          recommended={true}
        />

        <PreferenceToggle
          checked={customerNotifications}
          onChange={setCustomerNotifications}
          title="Customer Notifications"
          description="Automatically send appointment confirmations and reminders to your customers via SMS. Reduces no-shows and improves customer experience."
          icon="📱"
          color="purple"
        />
      </div>

      {/* Professional tip */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">💡</span>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">
              Professional Tip
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Most successful Flynn.ai users enable both features. Call
              summaries keep you organized, while customer notifications reduce
              no-shows by up to 40% and improve your professional image.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-200">
        <Button
          variant="light"
          onPress={onBack}
          className="text-slate-600 hover:text-slate-800"
        >
          ← Back
        </Button>

        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-500">
            Email preferences • Step 4 of 5
          </div>

          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
            size="lg"
            onPress={handleContinue}
          >
            Continue Setup →
          </Button>
        </div>
      </div>
    </div>
  );
}

// Industry Selection Step
function IndustrySelectionStep({
  onComplete,
  onBack,
  selectedIndustry,
  isLoading,
  error,
}: any) {
  const [selected, setSelected] = useState(selectedIndustry);

  const handleContinue = () => {
    if (selected) {
      onComplete(selected);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🏢</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4">
          What type of business are you in?
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Flynn.ai adapts its AI processing to your industry's terminology and
          extract the right types of appointments from your calls
        </p>
      </div>

      <IndustrySelectionWizard
        onSelect={setSelected}
        selectedIndustry={selected}
        showHeader={false}
      />

      {error && (
        <div className="mt-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center mt-12">
        <Button variant="light" onPress={onBack} isDisabled={isLoading}>
          Back
        </Button>

        <Button
          color="primary"
          size="lg"
          onPress={handleContinue}
          isLoading={isLoading}
          isDisabled={!selected}
        >
          {isLoading ? 'Saving...' : 'Continue Setup'}
        </Button>
      </div>
    </div>
  );
}

// AI Configuration Step
function AIConfigurationStep({
  onComplete,
  onBack,
  industry,
  isLoading,
  error,
}: any) {
  const [config, setConfig] = useState({
    emailSummaries: true,
    smsNotifications: false,
    calendarSync: true,
    aiProcessingEnabled: true,
  });

  const handleContinue = () => {
    onComplete(config);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚙️</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Configure Your AI Assistant
        </h2>
        <p className="text-lg text-muted-foreground">
          Customize how Flynn.ai processes calls and communicates with you
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4">
            Communication Preferences
          </h3>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.emailSummaries}
                onChange={(e) =>
                  setConfig({ ...config, emailSummaries: e.target.checked })
                }
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">Email Summaries</div>
                <div className="text-sm text-muted-foreground">
                  Receive professional email summaries within 2 minutes
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.smsNotifications}
                onChange={(e) =>
                  setConfig({ ...config, smsNotifications: e.target.checked })
                }
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">SMS Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Get instant SMS alerts for urgent calls
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.calendarSync}
                onChange={(e) =>
                  setConfig({ ...config, calendarSync: e.target.checked })
                }
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">Calendar Integration</div>
                <div className="text-sm text-muted-foreground">
                  Automatically create calendar events
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <h4 className="font-medium text-primary">
              AI Processing Always Active
            </h4>
          </div>
          <p className="text-sm text-primary-700">
            Your AI assistant will automatically process all business calls and
            filter out personal calls
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center mt-8">
        <Button variant="light" onPress={onBack} isDisabled={isLoading}>
          Back
        </Button>

        <Button
          color="primary"
          size="lg"
          onPress={handleContinue}
          isLoading={isLoading}
        >
          {isLoading ? 'Configuring...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
}

// Setup Complete Step
function SetupCompleteStep({
  onComplete,
  onBack,
  data,
  isLoading,
  error,
}: any) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckIcon className="w-10 h-10 text-success-600" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4">
          🎉 Flynn.ai is Ready!
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          Your AI assistant is now active and will process all your business
          calls automatically
        </p>
      </div>

      <div className="bg-gradient-to-r from-success/10 to-primary/10 border border-success/20 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          What Happens Now
        </h3>

        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-success text-white rounded-full flex items-center justify-center text-sm">
              ✓
            </div>
            <div>
              <p className="font-medium text-foreground">
                All calls are automatically processed
              </p>
              <p className="text-sm text-muted-foreground">
                Business calls get AI analysis, personal calls are filtered out
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-success text-white rounded-full flex items-center justify-center text-sm">
              ✓
            </div>
            <div>
              <p className="font-medium text-foreground">
                Email summaries within 2 minutes
              </p>
              <p className="text-sm text-muted-foreground">
                Professional summaries with appointment details
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-success text-white rounded-full flex items-center justify-center text-sm">
              ✓
            </div>
            <div>
              <p className="font-medium text-foreground">
                Calendar events created automatically
              </p>
              <p className="text-sm text-muted-foreground">
                Never miss another appointment
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-primary mb-2">Your Flynn.ai Setup</h4>
        <div className="space-y-2 text-sm text-left">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Industry:</span>
            <span className="font-medium">{data.industry || 'General'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Flynn.ai Number:</span>
            <span className="font-mono font-medium">
              {data.flynnNumber || 'Configured'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Phone:</span>
            <span className="font-mono font-medium">
              {data.userPhoneNumber || 'Connected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">AI Processing:</span>
            <span className="font-medium text-success">Active</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <XMarkIcon className="w-5 h-5 text-destructive" />
            <span className="text-destructive text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="light" onPress={onBack} isDisabled={isLoading}>
          Back
        </Button>

        <Button
          color="primary"
          size="lg"
          onPress={onComplete}
          isLoading={isLoading}
        >
          {isLoading ? 'Finalizing setup...' : 'Open Dashboard'}
        </Button>
      </div>
    </div>
  );
}
