'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/MinimalAuthProvider';
import TrialStatus from '@/components/billing/TrialStatus';
import SubscriptionDashboard from '@/components/billing/SubscriptionDashboard';
import UsageMetrics from '@/components/billing/UsageMetrics';
import SubscriptionTierSelector from '@/components/billing/SubscriptionTierSelector';
import { motion } from 'framer-motion';

interface TrialStatusData {
  isTrialActive: boolean;
  daysRemaining: number;
  trialEndDate: Date | null;
  subscriptionStatus: string;
  needsPaymentMethod: boolean;
}

interface UsageData {
  calls: number;
  events: number;
  aiAccuracy: number;
  calendarSyncRate: number;
  avgResponseTime: string;
}

export default function BillingPage() {
  const { user } = useAuthContext();
  const [trialStatus, setTrialStatus] = useState<TrialStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTierSelector, setShowTierSelector] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('basic');
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  useEffect(() => {
    async function fetchTrialStatus() {
      if (!user?.id) return;

      try {
        const response = await fetch(
          `/api/billing/trial-status?userId=${user.id}`
        );
        const data = await response.json();

        if (data.success) {
          setTrialStatus({
            isTrialActive: data.isTrialActive,
            daysRemaining: data.daysRemaining,
            trialEndDate: data.trialEndDate
              ? new Date(data.trialEndDate)
              : null,
            subscriptionStatus: data.subscriptionStatus || 'trial',
            needsPaymentMethod: data.needsPaymentMethod || false,
          });
        } else {
          setError(data.error || 'Failed to fetch trial status');
        }
      } catch (err) {
        console.error('Failed to fetch trial status:', err);
        setError('Failed to load billing information');
      } finally {
        setLoading(false);
      }
    }

    fetchTrialStatus();
  }, [user?.id]);

  const handleUpgrade = async (tier: string = selectedTier) => {
    if (!user?.id) return;

    setUpgradeLoading(true);
    try {
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tier,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session:', data.error);
        alert('Failed to start upgrade process. Please try again.');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start upgrade process. Please try again.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleShowTierSelector = () => {
    setShowTierSelector(true);
  };

  const handleSelectTier = (tier: string) => {
    setSelectedTier(tier);
  };

  const handleConfirmUpgrade = () => {
    handleUpgrade(selectedTier);
  };

  const handleManageSubscription = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create portal session:', data.error);
        alert('Failed to open billing portal. Please try again.');
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again.');
    }
  };

  const handleViewUsage = () => {
    document.getElementById('usage-metrics')?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Billing</h1>
          <p className="text-muted-foreground text-lg">
            Manage your subscription and billing preferences
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl shadow-sm p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading billing information...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Billing</h1>
          <p className="text-muted-foreground text-lg">
            Manage your subscription and billing preferences
          </p>
        </div>
        <div className="bg-card border border-red-200 rounded-2xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Loading Error
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isOnTrial =
    trialStatus?.subscriptionStatus === 'trial' && trialStatus.isTrialActive;
  const hasActiveSubscription = ['active', 'past_due', 'incomplete'].includes(
    trialStatus?.subscriptionStatus || ''
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Billing</h1>
        <p className="text-muted-foreground text-lg">
          Manage your subscription and billing preferences
        </p>
      </div>

      {/* Success/Error Messages from URL params */}
      {typeof window !== 'undefined' && (
        <>
          {new URLSearchParams(window.location.search).get('success') ===
            'true' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-green-900">
                    Payment Successful!
                  </h3>
                  <p className="text-green-700 text-sm">
                    Your subscription is now active. Welcome to Flynn.ai!
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {new URLSearchParams(window.location.search).get('cancelled') ===
            'true' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-amber-900">
                    Payment Cancelled
                  </h3>
                  <p className="text-amber-700 text-sm">
                    No worries! Your trial is still active. You can upgrade
                    anytime.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Billing Status Section */}
      <div className="grid gap-8">
        {isOnTrial ? (
          <TrialStatus
            isTrialActive={trialStatus.isTrialActive}
            daysRemaining={trialStatus.daysRemaining}
            trialEndDate={trialStatus.trialEndDate}
            onUpgrade={handleUpgrade}
            needsPaymentMethod={trialStatus.needsPaymentMethod}
            onChoosePlan={handleShowTierSelector}
          />
        ) : hasActiveSubscription ? (
          <SubscriptionDashboard
            subscriptionStatus={
              trialStatus?.subscriptionStatus as
                | 'active'
                | 'past_due'
                | 'cancelled'
                | 'incomplete'
            }
            nextBillingDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // Mock next billing date
            onManageSubscription={handleManageSubscription}
            onViewUsage={handleViewUsage}
          />
        ) : (
          // Fallback for cancelled or unknown status
          <div className="bg-card border border-border rounded-2xl shadow-sm p-8 text-center">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Start Your Flynn.ai Journey
            </h2>
            <p className="text-muted-foreground mb-6">
              Get started with a 30-day free trial. No credit card required.
            </p>
            <button
              onClick={handleShowTierSelector}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium"
            >
              Choose Your Plan
            </button>
          </div>
        )}
      </div>

      {/* Tier Selector Modal */}
      {showTierSelector && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground">
              Start with a 30-day free trial, then continue with the plan that
              fits your needs
            </p>
          </div>

          <SubscriptionTierSelector
            currentTier={
              trialStatus?.subscriptionStatus === 'active'
                ? selectedTier
                : undefined
            }
            onSelectTier={handleSelectTier}
            loading={upgradeLoading}
          />

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowTierSelector(false)}
              className="px-6 py-2 border border-border rounded-lg hover:bg-muted"
              disabled={upgradeLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmUpgrade}
              disabled={upgradeLoading}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {upgradeLoading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              Start Free Trial
            </button>
          </div>
        </motion.div>
      )}

      {/* Usage Metrics */}
      <div id="usage-metrics">
        <UsageMetrics period="month" />
      </div>

      {/* Australian Market Footer */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/10 dark:to-blue-950/10 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              🇦🇺 Built for Australian Businesses
            </h3>
            <p className="text-sm text-muted-foreground">
              GST inclusive pricing • Local support available • Optimized for
              AEST/AEDT timezone
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">
              Need help?
            </div>
            <div className="text-sm text-muted-foreground">
              support@flynn.ai
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
