'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@/components/MinimalAuthProvider';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/Button';
import AccountSettings from '@/components/settings/AccountSettings';
import EmailSettings from '@/components/settings/EmailSettings';
import CalendarSettings from '@/components/settings/CalendarSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import AISettings from '@/components/settings/AISettings';
import IndustryConfigurationSection from '@/components/industry/IndustryConfigurationSection';

interface SettingsTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  component: React.ComponentType<any>;
}

const settingsTabs: SettingsTab[] = [
  {
    id: 'account',
    label: 'Account',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    description: 'Profile information, business hours, and account details',
    component: AccountSettings,
  },
  {
    id: 'email',
    label: 'Email',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    description:
      'Email notifications, content preferences, and delivery settings',
    component: EmailSettings,
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    description: 'Calendar integrations, sync settings, and event preferences',
    component: CalendarSettings,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-5 5v-5zM8.828 8.828L3 15l1.414 1.414 5.657-5.657-1.243-1.243z"
        />
      </svg>
    ),
    description: 'Push notifications, SMS alerts, and quiet hours settings',
    component: NotificationSettings,
  },
  {
    id: 'ai',
    label: 'AI & Processing',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    description:
      'AI processing modes, confidence settings, and automation preferences',
    component: AISettings,
  },
];

export default function SettingsPage() {
  const { user, profile, loading } = useAuthContext();
  const router = useRouter();
  const {
    settings,
    isLoading: settingsLoading,
    isSaving,
    hasChanges,
    error,
    updateSettings,
    saveSettings,
    resetSettings,
  } = useSettings();

  const [activeTab, setActiveTab] = useState('account');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSave = async () => {
    const success = await saveSettings();
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const currentTab = settingsTabs.find((tab) => tab.id === activeTab);
  const TabComponent = currentTab?.component;

  if (loading || settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Settings
              </h1>
              <p className="text-muted-foreground text-lg">
                Customize your Flynn.ai experience and preferences
              </p>
            </div>

            {/* Save Status */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center space-x-2 bg-green-50 text-green-800 px-4 py-2 rounded-lg border border-green-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">
                    Settings saved successfully!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden sticky top-8">
              <div className="p-6 border-b border-border">
                <h2 className="font-semibold text-foreground">
                  Settings Categories
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure all aspects of your Flynn.ai experience
                </p>
              </div>

              <nav className="p-4 space-y-2">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-start space-x-3 p-4 rounded-lg text-left transition-all duration-200 group ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <span
                      className={`mt-0.5 transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    >
                      {tab.icon}
                    </span>
                    <div className="flex-1">
                      <div
                        className={`font-medium ${
                          activeTab === tab.id
                            ? 'text-primary-foreground'
                            : 'text-foreground'
                        }`}
                      >
                        {tab.label}
                      </div>
                      <div
                        className={`text-sm mt-1 leading-snug ${
                          activeTab === tab.id
                            ? 'text-primary-foreground/80'
                            : 'text-muted-foreground group-hover:text-muted-foreground'
                        }`}
                      >
                        {tab.description}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>

              {/* Industry Configuration Link */}
              <div className="p-4 border-t border-border">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span className="font-medium text-blue-800 text-sm">
                      Industry Settings
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mb-3">
                    Configure industry-specific settings and terminology
                  </p>
                  <Button
                    onClick={() => setActiveTab('industry')}
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300"
                  >
                    Configure Industry
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Settings Content */}
          <div className="flex-1">
            <div className="bg-card border border-border rounded-xl shadow-sm">
              <div className="border-b border-border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-primary">{currentTab?.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {currentTab?.label}
                      </h2>
                      <p className="text-muted-foreground">
                        {currentTab?.description}
                      </p>
                    </div>
                  </div>

                  {/* Global Actions */}
                  {hasChanges && (
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={resetSettings}
                        variant="secondary"
                        size="sm"
                        disabled={isSaving}
                      >
                        Reset
                      </Button>
                      <Button
                        onClick={handleSave}
                        size="sm"
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isSaving ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Saving...</span>
                          </div>
                        ) : (
                          'Save All Changes'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
                  >
                    <div className="flex items-start space-x-3">
                      <svg
                        className="w-5 h-5 text-red-500 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex-1">
                        <div className="font-medium text-red-800">
                          Settings Error
                        </div>
                        <div className="text-sm text-red-700 mt-1">{error}</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Settings Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'industry' ? (
                      <IndustryConfigurationSection />
                    ) : (
                      TabComponent && (
                        <TabComponent
                          settings={settings}
                          onUpdate={updateSettings}
                          hasChanges={hasChanges}
                          onSave={handleSave}
                          isSaving={isSaving}
                        />
                      )
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
