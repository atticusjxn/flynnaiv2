'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@/components/AuthProvider';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { 
  getAllIndustries, 
  getIndustryConfiguration,
  type IndustryConfiguration 
} from '@/lib/industry/configurations';
import IndustrySelector from './IndustrySelector';
import EventTypesConfiguration from './EventTypesConfiguration';
import TerminologySettings from './TerminologySettings';
import EmailTemplateConfiguration from './EmailTemplateConfiguration';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const tabs: TabConfig[] = [
  {
    id: 'industry',
    label: 'Industry',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    description: 'Configure your business industry and core settings'
  },
  {
    id: 'events',
    label: 'Event Types',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    description: 'Customize event types and scheduling preferences'
  },
  {
    id: 'terminology',
    label: 'Terminology',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    description: 'Customize language and terminology for your business'
  },
  {
    id: 'templates',
    label: 'Email Templates',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    description: 'Customize email templates and branding'
  }
];

export default function IndustryConfigurationSection() {
  const { profile } = useAuthContext();
  const [activeTab, setActiveTab] = useState('industry');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentIndustry, setCurrentIndustry] = useState<IndustryConfiguration | null>(null);

  useEffect(() => {
    if (profile?.industry_id) {
      const industry = getIndustryConfiguration(profile.industry_id);
      setCurrentIndustry(industry);
    }
  }, [profile]);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement save functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Industry Configuration
        </h2>
        <p className="text-muted-foreground">
          Customize Flynn.ai to match your business needs and industry requirements
        </p>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-border bg-muted/20">
          <div className="flex items-center justify-between px-6 py-4">
            <nav className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'group relative flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <span className={cn(
                    'transition-colors duration-200',
                    activeTab === tab.id ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  
                  {/* Active indicator */}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </nav>
            
            {/* Save Changes Button */}
            <AnimatePresence>
              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Tab Description */}
          <div className="px-6 pb-4">
            <p className="text-sm text-muted-foreground">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px] p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full"
            >
              {activeTab === 'industry' && (
                <IndustrySelector
                  currentIndustry={currentIndustry}
                  onIndustryChange={(industry) => {
                    setCurrentIndustry(industry);
                    setHasChanges(true);
                  }}
                />
              )}
              
              {activeTab === 'events' && currentIndustry && (
                <EventTypesConfiguration
                  industry={currentIndustry}
                  onChange={() => setHasChanges(true)}
                />
              )}
              
              {activeTab === 'terminology' && currentIndustry && (
                <TerminologySettings
                  industry={currentIndustry}
                  onChange={() => setHasChanges(true)}
                />
              )}
              
              {activeTab === 'templates' && currentIndustry && (
                <EmailTemplateConfiguration
                  industry={currentIndustry}
                  onChange={() => setHasChanges(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Configuration Preview */}
      {currentIndustry && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: currentIndustry.colors.primary }}
            />
            <span>Current Configuration: {currentIndustry.name}</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <span className="font-medium text-foreground">Default Duration</span>
              <p className="text-muted-foreground">{currentIndustry.defaultDuration} minutes</p>
            </div>
            
            <div className="space-y-2">
              <span className="font-medium text-foreground">Business Hours</span>
              <p className="text-muted-foreground">{currentIndustry.businessHours}</p>
            </div>
            
            <div className="space-y-2">
              <span className="font-medium text-foreground">Priority Levels</span>
              <p className="text-muted-foreground">{currentIndustry.urgencyLevels.length} configured</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}