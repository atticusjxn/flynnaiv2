'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/stripe/client';

interface SubscriptionDashboardProps {
  subscriptionStatus: 'active' | 'past_due' | 'cancelled' | 'incomplete';
  nextBillingDate?: Date;
  onManageSubscription: () => void;
  onViewUsage: () => void;
}

export default function SubscriptionDashboard({
  subscriptionStatus,
  nextBillingDate,
  onManageSubscription,
  onViewUsage
}: SubscriptionDashboardProps) {
  
  const getStatusColor = () => {
    switch (subscriptionStatus) {
      case 'active': return 'text-green-600';
      case 'past_due': return 'text-amber-600';
      case 'cancelled': return 'text-red-600';
      case 'incomplete': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusLabel = () => {
    switch (subscriptionStatus) {
      case 'active': return 'Active Subscription';
      case 'past_due': return 'Payment Past Due';
      case 'cancelled': return 'Cancelled';
      case 'incomplete': return 'Payment Required';
      default: return 'Unknown Status';
    }
  };

  const getStatusIcon = () => {
    switch (subscriptionStatus) {
      case 'active':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'past_due':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        );
      case 'cancelled':
      case 'incomplete':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        );
    }
  };

  const getIconBackground = () => {
    switch (subscriptionStatus) {
      case 'active': return 'bg-gradient-to-br from-green-500 to-green-600';
      case 'past_due': return 'bg-gradient-to-br from-amber-500 to-amber-600';
      case 'cancelled':
      case 'incomplete': return 'bg-gradient-to-br from-red-500 to-red-600';
      default: return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl shadow-sm p-8"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${getIconBackground()} rounded-full flex items-center justify-center`}>
            {getStatusIcon()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Flynn.ai Subscription</h2>
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusLabel()}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{formatCurrency(29)}</div>
          <div className="text-sm text-muted-foreground">per month (GST inc.)</div>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Plan</div>
          <div className="font-semibold text-foreground">Flynn.ai Pro</div>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Next Billing</div>
          <div className="font-semibold text-foreground">
            {nextBillingDate 
              ? nextBillingDate.toLocaleDateString('en-AU', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'N/A'
            }
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-6">
        <h3 className="font-semibold text-foreground mb-3">What's Included</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span className="text-muted-foreground">Unlimited calls</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span className="text-muted-foreground">AI event extraction</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span className="text-muted-foreground">Calendar sync</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span className="text-muted-foreground">Email notifications</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {subscriptionStatus === 'past_due' ? (
          <Button 
            onClick={onManageSubscription}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            Update Payment Method
          </Button>
        ) : subscriptionStatus === 'incomplete' ? (
          <Button 
            onClick={onManageSubscription}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
          >
            Complete Payment Setup
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button 
              onClick={onViewUsage}
              variant="outline"
              className="flex-1"
            >
              View Usage
            </Button>
            <Button 
              onClick={onManageSubscription}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Manage Subscription
            </Button>
          </div>
        )}
        
        <p className="text-xs text-center text-muted-foreground">
          Manage billing details, download invoices, and update payment methods
        </p>
      </div>
    </motion.div>
  );
}