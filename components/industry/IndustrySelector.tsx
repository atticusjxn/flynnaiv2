'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import {
  getAllIndustries,
  type IndustryConfiguration,
} from '@/lib/industry/configurations';

interface IndustryCardProps {
  industry: IndustryConfiguration;
  isSelected: boolean;
  onClick: () => void;
}

function IndustryCard({ industry, isSelected, onClick }: IndustryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative cursor-pointer rounded-xl border-2 transition-all duration-300',
        'hover:shadow-lg',
        isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-card hover:border-muted-foreground/20'
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg z-10"
          >
            <svg
              className="w-4 h-4 text-primary-foreground"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: industry.colors.primary }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: industry.colors.primary }}
            />
            <h3 className="text-lg font-semibold text-foreground">
              {industry.name}
            </h3>
          </div>

          {/* Hover icon */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Configuration details */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Primary Term:</span>
            <span className="font-medium text-foreground">
              {industry.terminology.appointment}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-medium text-foreground">
              {industry.terminology.customer}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Default Duration:</span>
            <span className="font-medium text-foreground">
              {industry.defaultDuration}min
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Urgency Levels:</span>
            <div className="flex items-center space-x-1">
              {industry.urgencyLevels.slice(0, 3).map((level, index) => (
                <div
                  key={level}
                  className={cn(
                    'w-2 h-2 rounded-full',
                    index === 0
                      ? 'bg-red-500'
                      : index === 1
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  )}
                />
              ))}
              {industry.urgencyLevels.length > 3 && (
                <span className="text-xs text-muted-foreground ml-1">
                  +{industry.urgencyLevels.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-4 text-xs">
            <div
              className={cn(
                'flex items-center space-x-1',
                industry.requiresLocation
                  ? 'text-green-600'
                  : 'text-muted-foreground'
              )}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Location Tracking</span>
            </div>

            <div
              className={cn(
                'flex items-center space-x-1',
                industry.pricingExpected
                  ? 'text-blue-600'
                  : 'text-muted-foreground'
              )}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Pricing</span>
            </div>

            {industry.complianceRequirements && (
              <div className="flex items-center space-x-1 text-purple-600">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Compliance</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface IndustrySelectorProps {
  currentIndustry: IndustryConfiguration | null;
  onIndustryChange: (industry: IndustryConfiguration) => void;
}

export default function IndustrySelector({
  currentIndustry,
  onIndustryChange,
}: IndustrySelectorProps) {
  const industries = getAllIndustries();
  const [selectedIndustry, setSelectedIndustry] =
    useState<IndustryConfiguration | null>(currentIndustry);

  const handleIndustrySelect = (industry: IndustryConfiguration) => {
    setSelectedIndustry(industry);
    onIndustryChange(industry);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-foreground">
          Select Your Business Industry
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the industry that best matches your business to optimize
          Flynn.ai for your specific needs. This will customize terminology,
          event types, and workflow patterns.
        </p>
      </div>

      {/* Industry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {industries.map((industry) => (
          <IndustryCard
            key={industry.id}
            industry={industry}
            isSelected={selectedIndustry?.id === industry.id}
            onClick={() => handleIndustrySelect(industry)}
          />
        ))}
      </div>

      {/* Selection Summary */}
      <AnimatePresence>
        {selectedIndustry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-muted/30 rounded-xl p-6 border border-border"
          >
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: selectedIndustry.colors.primary + '20',
                }}
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: selectedIndustry.colors.primary }}
                />
              </div>

              <div className="flex-1">
                <h4 className="text-lg font-semibold text-foreground">
                  {selectedIndustry.name} Selected
                </h4>
                <p className="text-sm text-muted-foreground">
                  Flynn.ai will be optimized for{' '}
                  {selectedIndustry.name.toLowerCase()} workflows and
                  terminology
                </p>
              </div>

              <div className="text-right space-y-1">
                <div className="text-sm font-medium text-foreground">
                  {selectedIndustry.terminology.events_title}
                </div>
                <div className="text-xs text-muted-foreground">
                  Default: {selectedIndustry.defaultDuration}min appointments
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Business Hours Preview */}
      {selectedIndustry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h5 className="font-medium text-foreground mb-3">
            Business Configuration Preview
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">Operating Hours</span>
              <p className="font-medium text-foreground">
                {selectedIndustry.businessHours}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Appointment Term</span>
              <p className="font-medium text-foreground capitalize">
                {selectedIndustry.terminology.appointment}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Customer Term</span>
              <p className="font-medium text-foreground capitalize">
                {selectedIndustry.terminology.customer}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
