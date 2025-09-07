'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/components/MinimalAuthProvider';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export default function OnboardingPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialStep, setInitialStep] = useState(1);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/login?redirect=/onboarding');
      return;
    }

    // Get initial step from URL params
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const step = parseInt(stepParam, 10);
      if (step >= 1 && step <= 5) {
        setInitialStep(step);
      }
    }
  }, [user, loading, router, searchParams]);

  const handleOnboardingComplete = () => {
    // Redirect to dashboard after successful onboarding
    router.push('/dashboard?welcome=true');
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <OnboardingFlow
      onComplete={handleOnboardingComplete}
      initialStep={initialStep}
    />
  );
}
