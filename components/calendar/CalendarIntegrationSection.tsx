'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/MinimalAuthProvider';

interface CalendarIntegration {
  id: string;
  provider: 'google' | 'outlook' | 'apple' | 'ical';
  is_active: boolean;
  calendar_count?: number;
  connected_at: string;
  last_sync_at?: string;
}

interface CalendarProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  available: boolean;
}

const CALENDAR_PROVIDERS: CalendarProvider[] = [
  {
    id: 'google',
    name: 'Google Calendar',
    icon: '📅',
    color: 'bg-blue-500',
    description: 'Sync with Google Calendar and Gmail',
    available: true,
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    icon: '📊',
    color: 'bg-blue-600',
    description: 'Sync with Microsoft Outlook',
    available: false,
  },
  {
    id: 'apple',
    name: 'Apple Calendar',
    icon: '🍎',
    color: 'bg-gray-800',
    description: 'Sync with iCloud Calendar',
    available: false,
  },
];

export default function CalendarIntegrationSection() {
  const { user } = useAuthContext();
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  // Load existing integrations
  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      // For now, return empty array since we haven't implemented the DB loading yet
      setIntegrations([]);
    } catch (error) {
      console.error('Error loading calendar integrations:', error);
    }
  };

  const connectCalendar = async (providerId: string) => {
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      console.log('Initiating calendar connection for provider:', providerId);

      // Call the auth endpoint to get the authorization URL
      const response = await fetch('/api/calendar/google/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.auth_url) {
        console.log('Redirecting to calendar authorization');
        // Redirect to Google's authorization page
        window.location.href = result.auth_url;
      } else {
        setMessage({
          type: 'error',
          content: result.error || 'Failed to initiate calendar connection',
        });
      }
    } catch (error) {
      console.error('Error connecting calendar:', error);
      setMessage({
        type: 'error',
        content: 'Network error. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectCalendar = async (integrationId: string) => {
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      // TODO: Implement disconnect API call
      setMessage({
        type: 'success',
        content: 'Calendar disconnected successfully',
      });
      await loadIntegrations();
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      setMessage({
        type: 'error',
        content: 'Failed to disconnect calendar',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testCalendarConnection = async () => {
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await fetch('/api/calendar/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test-provider',
          user_id: user?.id || '00000000-0000-0000-0000-000000000123',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          content: `Calendar test completed. ${
            result.auth_status.isAuthenticated
              ? `Found ${result.calendars_found} calendars.`
              : 'Not authenticated - please connect your calendar first.'
          }`,
        });
      } else {
        setMessage({
          type: 'error',
          content: result.error || 'Calendar test failed',
        });
      }
    } catch (error) {
      console.error('Error testing calendar:', error);
      setMessage({
        type: 'error',
        content: 'Network error during calendar test',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check for URL parameters indicating callback result
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const calendarSuccess = urlParams.get('calendar_success');
    const calendarError = urlParams.get('calendar_error');

    if (calendarSuccess === 'google_connected') {
      setMessage({
        type: 'success',
        content:
          'Google Calendar connected successfully! Your appointments will now sync automatically.',
      });
      loadIntegrations();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (calendarError) {
      setMessage({
        type: 'error',
        content: `Calendar connection failed: ${calendarError.replace(/_/g, ' ')}`,
      });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const getIntegrationForProvider = (
    providerId: string
  ): CalendarIntegration | undefined => {
    return integrations.find((i) => i.provider === providerId && i.is_active);
  };

  return (
    <div className="space-y-6">
      {/* Available Calendar Providers */}
      <div className="space-y-4">
        {CALENDAR_PROVIDERS.map((provider) => {
          const integration = getIntegrationForProvider(provider.id);
          const isConnected = !!integration;

          return (
            <div
              key={provider.id}
              className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                isConnected
                  ? 'border-green-200 bg-green-50/50'
                  : 'border-border bg-background hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-lg ${provider.color} flex items-center justify-center text-white text-xl`}
                >
                  {provider.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-card-foreground flex items-center space-x-2">
                    <span>{provider.name}</span>
                    {isConnected && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Connected
                      </span>
                    )}
                    {!provider.available && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Coming Soon
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {provider.description}
                  </p>
                  {isConnected && integration && (
                    <p className="text-xs text-green-600 mt-1">
                      Connected{' '}
                      {new Date(integration.connected_at).toLocaleDateString()}
                      {integration.calendar_count &&
                        ` • ${integration.calendar_count} calendars`}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {provider.available && (
                  <>
                    {isConnected ? (
                      <button
                        onClick={() =>
                          integration && disconnectCalendar(integration.id)
                        }
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => connectCalendar(provider.id)}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Connecting...' : 'Connect'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Test Connection Button */}
      <div className="pt-4 border-t border-border">
        <button
          onClick={testCalendarConnection}
          disabled={isLoading}
          className="w-full px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/20 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Calendar Connection'}
        </button>
      </div>

      {/* Calendar Sync Preferences */}
      <div className="pt-4 border-t border-border">
        <h4 className="font-semibold text-card-foreground mb-3">
          Sync Preferences
        </h4>
        <div className="space-y-3 text-sm">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
            <span className="text-card-foreground">
              Auto-sync appointments to calendar
            </span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
            <span className="text-card-foreground">
              Include customer contact details in events
            </span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
            <span className="text-card-foreground">
              Add 15-minute reminder notifications
            </span>
          </label>
        </div>
      </div>

      {/* Message Display */}
      {message.content && (
        <div
          className={`p-4 rounded-lg border-l-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-500 border border-green-200'
              : 'bg-red-50 text-red-800 border-red-500 border border-red-200'
          }`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
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
  );
}
