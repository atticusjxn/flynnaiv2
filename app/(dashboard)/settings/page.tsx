'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';

interface PhoneSetup {
  phoneNumber: string;
  isVerified: boolean;
  verificationCode: string;
}

export default function SettingsPage() {
  const { user, profile, loading } = useAuthContext();
  const router = useRouter();
  const [phoneSetup, setPhoneSetup] = useState<PhoneSetup>({
    phoneNumber: profile?.phone_number || '',
    isVerified: (profile?.settings as any)?.phone_verified || false,
    verificationCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [step, setStep] = useState<'input' | 'verify' | 'complete'>('input');

  useEffect(() => {
    // Temporarily disabled for testing
    // if (!loading && !user) {
    //   router.push('/login');
    // }
  }, [user, loading, router]);

  useEffect(() => {
    // Set initial step based on current phone setup
    const phoneVerified = (profile?.settings as any)?.phone_verified;
    if (profile?.phone_number && phoneVerified) {
      setStep('complete');
    } else if (profile?.phone_number && !phoneVerified) {
      setStep('verify');
    } else {
      setStep('input');
    }
    
    // Update phone setup state when profile changes
    setPhoneSetup(prev => ({
      ...prev,
      phoneNumber: profile?.phone_number || '',
      isVerified: phoneVerified || false
    }));
  }, [profile]);

  const handlePhoneChange = (value: string) => {
    setPhoneSetup(prev => ({ ...prev, phoneNumber: value }));
    setMessage({ type: '', content: '' });
  };

  const sendVerificationCode = async () => {
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await fetch('/api/phone/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneSetup.phoneNumber
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', content: `Verification code sent to ${phoneSetup.phoneNumber}` });
        setStep('verify');
      } else {
        setMessage({ type: 'error', content: result.error || 'Failed to send verification code' });
      }
    } catch (error) {
      setMessage({ type: 'error', content: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await fetch('/api/phone/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneSetup.phoneNumber,
          code: phoneSetup.verificationCode
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', content: 'Phone number verified successfully! You can now receive AI-powered call processing.' });
        setPhoneSetup(prev => ({ ...prev, isVerified: true }));
        setStep('complete');
      } else {
        setMessage({ type: 'error', content: result.error || 'Invalid verification code' });
      }
    } catch (error) {
      setMessage({ type: 'error', content: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const removePhoneNumber = async () => {
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await fetch('/api/phone/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', content: 'Phone number removed successfully' });
        setPhoneSetup({ phoneNumber: '', isVerified: false, verificationCode: '' });
        setStep('input');
      } else {
        setMessage({ type: 'error', content: result.error || 'Failed to remove phone number' });
      }
    } catch (error) {
      setMessage({ type: 'error', content: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Temporarily disabled for testing
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-background">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  //     </div>
  //   );
  // }

  // if (!user) {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                ← Back to Dashboard
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary-foreground rounded-full"></div>
                </div>
                <h1 className="text-xl font-bold text-card-foreground">Flynn.ai v2 - Settings</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {profile?.full_name || user.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Phone Setup</h2>
          <p className="text-muted-foreground">Set up your business phone number to start using Flynn.ai</p>
        </div>

        {/* Phone Setup Card */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Your Business Phone
              </h3>
              <p className="text-muted-foreground">
                We'll set up AI call processing for this number
              </p>
            </div>
            {phoneSetup.isVerified && (
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold border bg-green-50 text-green-800 border-green-200">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>✓ Active</span>
              </div>
            )}
          </div>

          {/* Step 1: Phone Number Input */}
          {step === 'input' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-card-foreground mb-2">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneSetup.phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+61 4XX XXX XXX"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter your Australian mobile number (+61 4XX XXX XXX)
                </p>
              </div>
              
              <button
                onClick={sendVerificationCode}
                disabled={isLoading || !phoneSetup.phoneNumber}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </div>
          )}

          {/* Step 2: Verification */}
          {step === 'verify' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-5a2 2 0 00-2-2H6a2 2 0 00-2 2v5a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-card-foreground mb-2">Check Your Phone</h4>
                <p className="text-muted-foreground">We sent a verification code to {phoneSetup.phoneNumber}</p>
              </div>

              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-card-foreground mb-2">
                  Verification Code
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  value={phoneSetup.verificationCode}
                  onChange={(e) => setPhoneSetup(prev => ({ ...prev, verificationCode: e.target.value }))}
                  placeholder="XXXXXX"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-center text-lg font-mono"
                  maxLength={6}
                />
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={verifyCode}
                  disabled={isLoading || phoneSetup.verificationCode.length !== 6}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
                
                <button
                  onClick={sendVerificationCode}
                  disabled={isLoading}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Resend Code
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 'complete' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-card-foreground mb-2">You're All Set!</h4>
                <p className="text-muted-foreground mb-4">
                  Your phone number <span className="font-medium text-card-foreground">{phoneSetup.phoneNumber}</span> is verified and ready for AI call processing.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                  <p><strong>Next steps:</strong></p>
                  <ul className="mt-2 space-y-1 text-left">
                    <li>• Calls to your number will be processed by Flynn.ai</li>
                    <li>• Press *7 during any call to activate AI processing</li>
                    <li>• You'll receive email summaries within 2 minutes</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setStep('input')}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Change Phone Number
                </button>
                
                <button
                  onClick={removePhoneNumber}
                  disabled={isLoading}
                  className="w-full bg-red-50 text-red-600 hover:bg-red-100 font-medium py-2 px-4 rounded-lg border border-red-200 transition-colors"
                >
                  {isLoading ? 'Removing...' : 'Remove Phone Number'}
                </button>
              </div>
            </div>
          )}

          {/* Message Display */}
          {message.content && (
            <div className={`mt-6 p-4 rounded-lg border-l-4 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border-green-500 border border-green-200' 
                : 'bg-red-50 text-red-800 border-red-500 border border-red-200'
            }`} role="alert" aria-live="polite">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {message.type === 'success' ? (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium">
                    {message.type === 'success' ? 'Success!' : 'Error'}
                  </p>
                  <p className="mt-1 text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How it Works */}
        <div className="mt-8 bg-card border border-border rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">How Flynn.ai Works</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">1</div>
              <p>Customers call your verified phone number as usual</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">2</div>
              <p>Press *7 during any call to silently activate AI processing</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">3</div>
              <p>Continue your conversation normally - the caller won't know AI is active</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">4</div>
              <p>Receive a professional email summary with calendar events within 2 minutes</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}