'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { Tabs, Tab } from '@nextui-org/tabs';
import { Chip } from '@nextui-org/chip';
import {
  PhoneIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';

interface PhoneSetupGuideProps {
  onComplete: (phoneConfig: PhoneConfiguration) => void;
  onBack?: () => void;
  initialConfig?: PhoneConfiguration;
  className?: string;
}

interface PhoneConfiguration {
  phoneNumber: string;
  setupMethod: 'new' | 'existing';
  webhookUrl?: string;
  verified: boolean;
}

const WEBHOOK_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://flynn.ai'
    : 'https://your-ngrok-url.ngrok.io';

export default function PhoneSetupGuide({
  onComplete,
  onBack,
  initialConfig,
  className = '',
}: PhoneSetupGuideProps) {
  const [setupMethod, setSetupMethod] = useState<'new' | 'existing'>(
    initialConfig?.setupMethod || 'new'
  );
  const [phoneNumber, setPhoneNumber] = useState(
    initialConfig?.phoneNumber || ''
  );
  const [webhookUrl] = useState(
    `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice`
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(
    initialConfig?.verified || false
  );
  const [error, setError] = useState('');

  const handlePhoneNumberChange = (value: string) => {
    // Format phone number as user types
    const cleaned = value.replace(/\D/g, '');
    const formatted = formatPhoneNumber(cleaned);
    setPhoneNumber(formatted);
    setError('');
  };

  const formatPhoneNumber = (phone: string): string => {
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const handleVerifyPhone = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Simulate verification process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In real implementation, this would make an API call to verify the phone setup
      const response = await fetch('/api/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          setupMethod,
          webhookUrl,
        }),
      });

      if (response.ok) {
        setIsVerified(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleComplete = () => {
    if (!isVerified) {
      setError('Please verify your phone number first');
      return;
    }

    onComplete({
      phoneNumber,
      setupMethod,
      webhookUrl,
      verified: isVerified,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50 rounded-full mb-6 backdrop-blur-sm">
          <PhoneIcon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            Phone Integration
          </span>
        </div>

        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 animate-pulse" />
            <PhoneIcon className="w-10 h-10 text-blue-600 relative z-10" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent mb-4">
          Connect Your Phone System
        </h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Choose the setup method that works best for your business. Both
          options provide the same premium AI processing capabilities.
        </p>
      </div>

      <Tabs
        selectedKey={setupMethod}
        onSelectionChange={(key) => setSetupMethod(key as 'new' | 'existing')}
        className="mb-8"
        classNames={{
          tabList:
            'w-full bg-white/60 backdrop-blur-sm border border-slate-200/60 p-1 rounded-2xl shadow-lg shadow-slate-900/5',
          tab: 'flex-1 text-base font-semibold data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-blue-500 data-[selected=true]:to-purple-600 data-[selected=true]:text-white data-[selected=true]:shadow-lg rounded-xl transition-all duration-300',
          cursor:
            'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg rounded-xl',
          tabContent: 'group-data-[selected=true]:text-white text-slate-600',
        }}
      >
        <Tab key="new" title="🚀 Get New Number">
          <div className="relative mt-6">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-emerald-50/40 to-green-50/80 rounded-3xl" />
            <Card className="relative bg-white/80 backdrop-blur-sm border border-green-200/50 shadow-xl shadow-green-500/10">
              <CardHeader className="text-center pb-3">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                    <span className="text-white text-xl">📞</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-slate-800">
                      Get a Flynn.ai Number
                    </h3>
                    <p className="text-sm text-slate-600">
                      Professional business phone ready in minutes
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardBody className="space-y-6">
                {/* Premium recommendation banner */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="font-semibold text-green-800">
                          Recommended for Most Users
                        </h4>
                        <span className="px-2 py-1 bg-green-100 border border-green-200 rounded-full text-xs font-medium text-green-700">
                          Most Popular
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-green-700">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            <span>Instant setup - ready in 5 minutes</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-700">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            <span>Pre-configured for Flynn.ai AI</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-green-700">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            <span>Automatic call recording & processing</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-700">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            <span>Professional local business number</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Area code selection */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span className="text-lg">📍</span>
                    Area Code Preference (Optional)
                  </label>
                  <Input
                    placeholder="Enter area code (e.g., 555)"
                    maxLength={3}
                    size="lg"
                    classNames={{
                      input: 'text-lg font-medium',
                      inputWrapper:
                        'bg-white/70 border-slate-200/60 hover:bg-white/90 group-data-[focus=true]:bg-white/90',
                    }}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      e.target.value = value;
                    }}
                  />
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <InformationCircleIcon className="w-4 h-4" />
                    We'll find the best available number in your preferred area
                    code
                  </p>
                </div>

                {/* Action button */}
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl shadow-green-500/25 hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 transform hover:scale-[1.02] font-semibold text-base"
                  isLoading={isVerifying}
                  onPress={handleVerifyPhone}
                  startContent={
                    !isVerifying && <span className="text-xl">🎉</span>
                  }
                >
                  {isVerifying
                    ? 'Setting up your premium number...'
                    : 'Get My Flynn.ai Number'}
                </Button>

                {/* Success state */}
                {isVerified && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 rounded-xl p-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                        <CheckIcon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-green-800 mb-2">
                          Number Configured Successfully!
                        </h4>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-green-700">
                            Your new Flynn.ai number:{' '}
                            <strong className="text-lg font-mono bg-white/60 px-2 py-1 rounded border border-green-200">
                              {phoneNumber}
                            </strong>
                          </p>
                          <p className="text-sm text-green-600">
                            ✨ Start using *7 during calls immediately to
                            activate AI processing
                          </p>
                        </div>

                        <div className="bg-white/60 border border-green-200 rounded-lg p-3">
                          <p className="text-xs text-green-600 font-medium mb-1">
                            Next Step:
                          </p>
                          <p className="text-xs text-green-700">
                            Update your business listings, website, and
                            marketing materials with your new professional
                            number.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="existing" title="⚙️ Use Existing Number">
          <div className="relative mt-6">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-amber-50/80 rounded-3xl" />
            <Card className="relative bg-white/80 backdrop-blur-sm border border-amber-200/50 shadow-xl shadow-amber-500/10">
              <CardHeader className="text-center pb-3">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <span className="text-white text-xl">⚙️</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-slate-800">
                      Connect Existing Number
                    </h3>
                    <p className="text-sm text-slate-600">
                      Advanced integration for existing systems
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardBody className="space-y-6">
                {/* Advanced setup warning */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <InformationCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="font-semibold text-amber-800">
                          Advanced Technical Setup
                        </h4>
                        <span className="px-2 py-1 bg-amber-100 border border-amber-200 rounded-full text-xs font-medium text-amber-700">
                          For Tech-Savvy Users
                        </span>
                      </div>

                      <p className="text-sm text-amber-700 leading-relaxed mb-4">
                        This option requires configuring your existing phone
                        system with Twilio webhooks. Recommended for businesses
                        with technical experience or dedicated IT support.
                      </p>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-amber-700">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                            <span>Keep your existing business number</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-amber-700">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                            <span>No customer-facing changes</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-amber-700">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                            <span>Requires Twilio webhook setup</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-amber-700">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                            <span>Technical configuration needed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone number input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span className="text-lg">📞</span>
                    Your Business Phone Number
                  </label>
                  <Input
                    placeholder="(555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    size="lg"
                    startContent={
                      <PhoneIcon className="w-5 h-5 text-slate-400" />
                    }
                    classNames={{
                      input: 'text-lg font-medium',
                      inputWrapper:
                        'bg-white/70 border-slate-200/60 hover:bg-white/90 group-data-[focus=true]:bg-white/90',
                    }}
                  />
                </div>

                {/* Configuration steps */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                    <span className="text-xl">🔧</span>
                    Required Configuration Steps
                  </h4>

                  {/* Webhook URL section */}
                  <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-slate-700">
                        Twilio Webhook URL
                      </label>
                      <Button
                        size="sm"
                        variant="flat"
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                        onPress={() => copyToClipboard(webhookUrl)}
                        startContent={
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        }
                      >
                        Copy URL
                      </Button>
                    </div>
                    <Input
                      value={webhookUrl}
                      readOnly
                      size="sm"
                      classNames={{
                        input: 'font-mono text-sm',
                        inputWrapper: 'bg-white/80 border-slate-200',
                      }}
                    />
                  </div>

                  {/* Step-by-step guide */}
                  <div className="bg-white/60 border border-slate-200/60 rounded-xl p-6">
                    <h5 className="font-medium text-slate-700 mb-4">
                      Setup Instructions:
                    </h5>
                    <div className="space-y-3">
                      {[
                        'Log into your Twilio Console',
                        'Navigate to Phone Numbers → Manage → Active numbers',
                        'Click your phone number',
                        'Set "A call comes in" webhook to the URL above',
                        'Enable "Primary handler fails" failover',
                        'Save configuration and test',
                      ].map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-sm text-slate-600">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Verify button */}
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 transform hover:scale-[1.02] font-semibold text-base"
                  isLoading={isVerifying}
                  onPress={handleVerifyPhone}
                  isDisabled={!validatePhoneNumber(phoneNumber)}
                  startContent={
                    !isVerifying && <span className="text-xl">🔍</span>
                  }
                >
                  {isVerifying
                    ? 'Verifying configuration...'
                    : 'Verify Phone Setup'}
                </Button>

                {/* Success state */}
                {isVerified && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 rounded-xl p-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                        <CheckIcon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-green-800 mb-2">
                          Phone Verified Successfully!
                        </h4>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-green-700">
                            Your business number{' '}
                            <strong className="text-lg font-mono bg-white/60 px-2 py-1 rounded border border-green-200">
                              {phoneNumber}
                            </strong>{' '}
                            is configured and ready.
                          </p>
                          <p className="text-sm text-green-600">
                            ✨ Start using *7 during calls to activate AI
                            processing
                          </p>
                        </div>

                        <div className="bg-white/60 border border-green-200 rounded-lg p-3">
                          <p className="text-xs text-green-600 font-medium mb-1">
                            All Set!
                          </p>
                          <p className="text-xs text-green-700">
                            Your existing phone number is now powered by
                            Flynn.ai. Customers will notice no changes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl p-6 mb-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <ExclamationTriangleIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Setup Issue</h4>
              <p className="text-sm text-red-600">{error}</p>
              <p className="text-xs text-red-500 mt-2">
                Need help? Our support team is available 24/7 to assist with
                phone setup.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Premium Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-200">
        {onBack && (
          <Button
            variant="light"
            onPress={onBack}
            className="text-slate-600 hover:text-slate-800 transition-colors duration-200"
            startContent={<span>←</span>}
          >
            Back to Industry Selection
          </Button>
        )}

        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-500">
            Phone setup • Step 2 of 5
          </div>

          <Button
            size="lg"
            onPress={handleComplete}
            isDisabled={!isVerified}
            className={`transition-all duration-300 transform ${
              isVerified
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            endContent={<span>→</span>}
          >
            {isVerified ? 'Continue Setup' : 'Verify Phone First'}
          </Button>
        </div>
      </div>

      {/* Help section */}
      <div className="mt-8 text-center">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 border border-slate-200/50 rounded-xl p-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">
            Need assistance?
          </h4>
          <p className="text-xs text-slate-600 mb-3">
            Our technical team can help you set up phone integration in minutes.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-slate-600">Live chat support</span>
            </span>
            <span className="text-slate-400">•</span>
            <span className="flex items-center gap-1">
              <span className="text-slate-600">📧 help@flynn.ai</span>
            </span>
            <span className="text-slate-400">•</span>
            <span className="flex items-center gap-1">
              <span className="text-slate-600">📞 24/7 phone support</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
