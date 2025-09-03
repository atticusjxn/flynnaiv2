'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/stripe/client';

interface TrialStatusProps {
  isTrialActive: boolean;
  daysRemaining: number;
  trialEndDate: Date | null;
  onUpgrade: () => void;
  needsPaymentMethod: boolean;
  onChoosePlan?: () => void;
}

export default function TrialStatus({
  isTrialActive,
  daysRemaining,
  trialEndDate,
  onUpgrade,
  needsPaymentMethod,
  onChoosePlan,
}: TrialStatusProps) {
  const getTrialStatusColor = () => {
    if (!isTrialActive) return 'text-muted-foreground';
    if (daysRemaining <= 3) return 'text-red-600';
    if (daysRemaining <= 7) return 'text-amber-600';
    return 'text-green-600';
  };

  const getTrialStatusMessage = () => {
    if (!isTrialActive) return 'Trial expired';
    if (daysRemaining === 0) return 'Trial expires today';
    if (daysRemaining === 1) return '1 day remaining';
    return `${daysRemaining} days remaining`;
  };

  const getProgressPercentage = () => {
    const totalTrialDays = 30;
    const remainingPercentage = (daysRemaining / totalTrialDays) * 100;
    return Math.max(0, Math.min(100, remainingPercentage));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl shadow-sm p-8"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Free Trial</h2>
              <p className="text-sm text-muted-foreground">
                Full access to all features
              </p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-sm font-medium ${getTrialStatusColor()}`}>
            {getTrialStatusMessage()}
          </p>
          {trialEndDate && (
            <p className="text-xs text-muted-foreground mt-1">
              Expires{' '}
              {trialEndDate.toLocaleDateString('en-AU', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isTrialActive && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Trial Progress
            </span>
            <span className="text-sm font-medium text-foreground">
              {30 - daysRemaining}/30 days used
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${100 - getProgressPercentage()}%` }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] as any }}
            />
          </div>
        </div>
      )}

      {/* Trial Benefits */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-foreground">Unlimited</div>
          <div className="text-sm text-muted-foreground">Calls & Events</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-foreground">Full</div>
          <div className="text-sm text-muted-foreground">Feature Access</div>
        </div>
      </div>

      {/* After Trial Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Continue with Flynn.ai
            </h3>
            <p className="text-sm text-muted-foreground">
              After your trial:{' '}
              <span className="font-semibold text-foreground">
                {formatCurrency(29)}/month
              </span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">GST inclusive</div>
            <div className="text-xs text-muted-foreground">Cancel anytime</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {needsPaymentMethod ? (
          <Button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            Add Payment Method - Trial Ending Soon
          </Button>
        ) : daysRemaining <= 7 ? (
          <>
            <Button
              onClick={onChoosePlan || onUpgrade}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Choose Plan & Continue Service
            </Button>
            {onChoosePlan && (
              <Button
                onClick={onUpgrade}
                variant="outline"
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Quick Upgrade to Basic ($29/month)
              </Button>
            )}
          </>
        ) : (
          <>
            {onChoosePlan ? (
              <>
                <Button
                  onClick={onChoosePlan}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  Choose Your Plan
                </Button>
                <Button
                  onClick={onUpgrade}
                  variant="outline"
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  Quick Upgrade to Basic
                </Button>
              </>
            ) : (
              <Button
                onClick={onUpgrade}
                variant="outline"
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Upgrade Early & Support Flynn.ai
              </Button>
            )}
          </>
        )}

        <p className="text-xs text-center text-muted-foreground">
          No credit card required during trial • Cancel anytime • Australian
          pricing
        </p>
      </div>
    </motion.div>
  );
}
