'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface SubscriptionTier {
  id: string;
  name: string;
  priceAud: number;
  priceFormatted: string;
  features: string[];
  callLimit: number;
  callLimitFormatted: string;
  capabilities: {
    hasCalendarSync: boolean;
    hasSmsNotifications: boolean;
    hasBulkManagement: boolean;
    hasApiAccess: boolean;
  };
  popular: boolean;
}

interface SubscriptionTierSelectorProps {
  currentTier?: string;
  onSelectTier: (tier: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function SubscriptionTierSelector({
  currentTier,
  onSelectTier,
  loading = false,
  disabled = false,
}: SubscriptionTierSelectorProps) {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string>(
    currentTier || 'professional'
  );

  useEffect(() => {
    async function fetchTiers() {
      try {
        const response = await fetch('/api/billing/tiers');
        const data = await response.json();

        if (data.success) {
          setTiers(data.tiers);
        }
      } catch (error) {
        console.error('Failed to fetch tiers:', error);
      } finally {
        setLoadingTiers(false);
      }
    }

    fetchTiers();
  }, []);

  useEffect(() => {
    if (currentTier) {
      setSelectedTier(currentTier);
    }
  }, [currentTier]);

  const handleSelectTier = (tierId: string) => {
    if (!disabled && !loading) {
      setSelectedTier(tierId);
      onSelectTier(tierId);
    }
  };

  if (loadingTiers) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-2xl p-6 animate-pulse"
          >
            <div className="h-6 bg-muted rounded mb-4"></div>
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="space-y-2 mb-6">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tiers.map((tier) => (
        <motion.div
          key={tier.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: tiers.indexOf(tier) * 0.1 }}
          className={`relative bg-card border rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
            selectedTier === tier.id
              ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
              : 'border-border hover:border-blue-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => handleSelectTier(tier.id)}
        >
          {/* Popular Badge */}
          {tier.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
            </div>
          )}

          {/* Current Plan Badge */}
          {currentTier === tier.id && (
            <div className="absolute -top-3 right-4">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Current Plan
              </div>
            </div>
          )}

          {/* Tier Header */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-foreground mb-2">
              {tier.name}
            </h3>
            <div className="mb-2">
              <span className="text-3xl font-bold text-foreground">
                {tier.priceFormatted}
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {tier.callLimitFormatted}
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-3 mb-6">
            {tier.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* Capabilities Icons */}
          <div className="flex justify-center gap-4 mb-6 py-3 border-t border-border">
            <div
              className={`flex flex-col items-center ${tier.capabilities.hasCalendarSync ? 'opacity-100' : 'opacity-40'}`}
            >
              <svg
                className="w-5 h-5 text-blue-500 mb-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
              <span className="text-xs text-muted-foreground">Calendar</span>
            </div>

            <div
              className={`flex flex-col items-center ${tier.capabilities.hasSmsNotifications ? 'opacity-100' : 'opacity-40'}`}
            >
              <svg
                className="w-5 h-5 text-green-500 mb-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                />
              </svg>
              <span className="text-xs text-muted-foreground">SMS</span>
            </div>

            <div
              className={`flex flex-col items-center ${tier.capabilities.hasBulkManagement ? 'opacity-100' : 'opacity-40'}`}
            >
              <svg
                className="w-5 h-5 text-purple-500 mb-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v9a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V9a2.25 2.25 0 0 0-1.5-2.122M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v9a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V9a2.25 2.25 0 0 0-1.5-2.122"
                />
              </svg>
              <span className="text-xs text-muted-foreground">Bulk</span>
            </div>

            <div
              className={`flex flex-col items-center ${tier.capabilities.hasApiAccess ? 'opacity-100' : 'opacity-40'}`}
            >
              <svg
                className="w-5 h-5 text-orange-500 mb-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                />
              </svg>
              <span className="text-xs text-muted-foreground">API</span>
            </div>
          </div>

          {/* Selection Indicator */}
          {selectedTier === tier.id && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center gap-2 text-blue-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm font-medium">Selected</span>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
