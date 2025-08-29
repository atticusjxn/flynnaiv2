'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { type IndustryConfiguration } from '@/lib/industry/configurations';

interface TerminologyItem {
  key: string;
  label: string;
  value: string;
  originalValue: string;
  description: string;
  category: 'core' | 'events' | 'customer';
  required: boolean;
}

interface PreviewCardProps {
  terminology: Record<string, string>;
  industry: IndustryConfiguration;
}

function PreviewCard({ terminology, industry }: PreviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card border border-border rounded-xl p-6 space-y-4 sticky top-4"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: industry.colors.primary }}
        />
        <h4 className="font-semibold text-foreground">Live Preview</h4>
      </div>

      {/* Sample Email Content */}
      <div className="space-y-3 text-sm">
        <div className="bg-muted/30 rounded-lg p-4">
          <h5 className="font-medium text-foreground mb-2">Email Subject:</h5>
          <p className="text-muted-foreground">
            {terminology.summary_title || 'Call Summary'} - New {terminology.appointment || 'appointment'} scheduled
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <h5 className="font-medium text-foreground mb-2">Sample Content:</h5>
          <div className="space-y-2 text-muted-foreground">
            <p>
              Your {terminology.customer || 'customer'} John Smith called to schedule a {terminology.appointment || 'appointment'}.
            </p>
            <p>
              <strong>{terminology.events_title || 'Events'}:</strong>
            </p>
            <p className="ml-4">
              • {terminology.service_call || 'Service Call'} - Tomorrow at 2:00 PM
            </p>
            {terminology.quote && (
              <p className="ml-4">
                • {terminology.quote} - Price estimate requested
              </p>
            )}
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <h5 className="font-medium text-foreground mb-2">Dashboard View:</h5>
          <div className="space-y-1 text-muted-foreground">
            <p>📅 {terminology.events_title || 'Events'} (3)</p>
            <p>👤 {terminology.customer || 'Customer'} Details</p>
            <p>📋 {terminology.summary_title || 'Call Summary'}</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Changes are applied in real-time to help you see how they'll appear to your customers
        </p>
      </div>
    </motion.div>
  );
}

interface TerminologyInputProps {
  item: TerminologyItem;
  onChange: (key: string, value: string) => void;
  onReset: (key: string) => void;
}

function TerminologyInput({ item, onChange, onReset }: TerminologyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasChanged = item.value !== item.originalValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group relative bg-card border rounded-xl p-4 transition-all duration-200',
        isFocused ? 'border-primary shadow-sm' : 'border-border hover:border-muted-foreground/20',
        hasChanged && 'bg-blue-50/50 border-blue-200'
      )}
    >
      {/* Change indicator */}
      {hasChanged && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-1">
            {item.label}
            {item.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            {item.description}
          </p>
        </div>
        
        {hasChanged && (
          <button
            onClick={() => onReset(item.key)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>
        )}
      </div>

      <input
        type="text"
        value={item.value}
        onChange={(e) => onChange(item.key, e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={item.originalValue}
        className={cn(
          'w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors',
          'border-border'
        )}
      />

      {item.originalValue !== item.value && (
        <div className="mt-2 text-xs text-muted-foreground">
          Default: "{item.originalValue}"
        </div>
      )}
    </motion.div>
  );
}

interface TerminologySettingsProps {
  industry: IndustryConfiguration;
  onChange: () => void;
}

export default function TerminologySettings({ industry, onChange }: TerminologySettingsProps) {
  const [terminologyItems, setTerminologyItems] = useState<TerminologyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentTerminology, setCurrentTerminology] = useState<Record<string, string>>({});

  // Initialize terminology items from industry configuration
  useEffect(() => {
    const items: TerminologyItem[] = [
      // Core terminology
      {
        key: 'appointment',
        label: 'Appointment',
        value: industry.terminology.appointment || 'appointment',
        originalValue: industry.terminology.appointment || 'appointment',
        description: 'Primary term for scheduled meetings/services',
        category: 'core',
        required: true
      },
      {
        key: 'service_call',
        label: 'Service Call',
        value: industry.terminology.service_call || 'service call',
        originalValue: industry.terminology.service_call || 'service call',
        description: 'Term for service-related appointments',
        category: 'core',
        required: true
      },
      {
        key: 'customer',
        label: 'Customer',
        value: industry.terminology.customer || 'customer',
        originalValue: industry.terminology.customer || 'customer',
        description: 'Term for people who book appointments',
        category: 'customer',
        required: true
      },
      {
        key: 'events_title',
        label: 'Events Title',
        value: industry.terminology.events_title || 'Events',
        originalValue: industry.terminology.events_title || 'Events',
        description: 'Header text for events/appointments section',
        category: 'core',
        required: true
      },
      {
        key: 'summary_title',
        label: 'Summary Title',
        value: industry.terminology.summary_title || 'Call Summary',
        originalValue: industry.terminology.summary_title || 'Call Summary',
        description: 'Header text for call summary emails',
        category: 'core',
        required: true
      }
    ];

    // Add optional industry-specific terms
    const optionalTerms = [
      'quote', 'emergency', 'meeting', 'consultation', 
      'inspection', 'showing', 'urgent'
    ];

    optionalTerms.forEach(term => {
      if (industry.terminology[term]) {
        items.push({
          key: term,
          label: term.charAt(0).toUpperCase() + term.slice(1).replace('_', ' '),
          value: industry.terminology[term] || '',
          originalValue: industry.terminology[term] || '',
          description: `Industry-specific term for ${term.replace('_', ' ')}`,
          category: 'events',
          required: false
        });
      }
    });

    setTerminologyItems(items);
    
    // Set current terminology
    const terminology: Record<string, string> = {};
    items.forEach(item => {
      terminology[item.key] = item.value;
    });
    setCurrentTerminology(terminology);
  }, [industry]);

  const handleTerminologyChange = (key: string, value: string) => {
    setTerminologyItems(prev => 
      prev.map(item => 
        item.key === key ? { ...item, value } : item
      )
    );
    
    setCurrentTerminology(prev => ({
      ...prev,
      [key]: value
    }));
    
    onChange();
  };

  const handleReset = (key: string) => {
    const item = terminologyItems.find(item => item.key === key);
    if (item) {
      handleTerminologyChange(key, item.originalValue);
    }
  };

  const handleResetAll = () => {
    setTerminologyItems(prev => 
      prev.map(item => ({ ...item, value: item.originalValue }))
    );
    
    const resetTerminology: Record<string, string> = {};
    terminologyItems.forEach(item => {
      resetTerminology[item.key] = item.originalValue;
    });
    setCurrentTerminology(resetTerminology);
    
    onChange();
  };

  const filteredItems = terminologyItems.filter(item => {
    const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Terms', count: terminologyItems.length },
    { id: 'core', label: 'Core Terms', count: terminologyItems.filter(i => i.category === 'core').length },
    { id: 'events', label: 'Event Types', count: terminologyItems.filter(i => i.category === 'events').length },
    { id: 'customer', label: 'Customer Terms', count: terminologyItems.filter(i => i.category === 'customer').length }
  ];

  const hasChanges = terminologyItems.some(item => item.value !== item.originalValue);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Terminology Customization
          </h3>
          <p className="text-muted-foreground mt-1">
            Customize the language Flynn.ai uses to match your business communication style
          </p>
        </div>
        
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Button
                onClick={handleResetAll}
                variant="outline"
                size="sm"
                className="text-muted-foreground"
              >
                Reset All
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search terminology..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="flex items-center space-x-1 bg-muted/30 rounded-lg p-1">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {category.label}
                  <span className="ml-1 text-xs opacity-60">
                    ({category.count})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Terminology Grid */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TerminologyInput
                    item={item}
                    onChange={handleTerminologyChange}
                    onReset={handleReset}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed border-border"
            >
              <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h4 className="text-lg font-medium text-foreground mb-2">
                No terms found
              </h4>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="xl:col-span-1">
          <PreviewCard 
            terminology={currentTerminology} 
            industry={industry}
          />
        </div>
      </div>

      {/* Change Summary */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h4 className="font-medium text-blue-800">
                {terminologyItems.filter(i => i.value !== i.originalValue).length} Changes Pending
              </h4>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              {terminologyItems
                .filter(i => i.value !== i.originalValue)
                .map(item => (
                  <div key={item.key} className="flex items-center space-x-2">
                    <span>•</span>
                    <span>{item.label}: "{item.originalValue}" → "{item.value}"</span>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}