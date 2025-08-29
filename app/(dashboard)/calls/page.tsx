'use client';

import { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import CallHistoryList from '@/components/calls/CallHistoryList';
import { Database } from '@/types/database.types';

type CallRecord = Database['public']['Tables']['calls']['Row'];

// Mock data for development - replace with real API calls
const mockCalls: CallRecord[] = [
  {
    id: '1',
    user_id: 'user-1',
    phone_number_id: 'phone-1',
    twilio_call_sid: 'CA1234567890',
    caller_number: '+1 (555) 123-4567',
    caller_name: 'John Smith',
    call_status: 'completed',
    call_direction: 'inbound',
    call_duration: 185,
    recording_url: 'https://example.com/recording1.mp3',
    recording_sid: 'RE1234567890',
    transcription_text: 'Hi, I need to schedule a plumbing service for tomorrow morning. I have a leak in my kitchen sink that\'s getting worse. Can we set up an appointment around 10 AM?',
    transcription_confidence: 0.92,
    ai_processing_status: 'completed',
    main_topic: 'Emergency Plumbing Service Request',
    call_summary: 'Customer John Smith needs urgent plumbing service for kitchen sink leak. Prefers morning appointment around 10 AM tomorrow.',
    sentiment_analysis: { overall: 'concerned', urgency: 'high' },
    urgency_level: 'high',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updated_at: new Date().toISOString(),
    processed_at: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
    email_sent_at: new Date(Date.now() - 1000 * 60 * 60 * 1.4).toISOString(),
  },
  {
    id: '2',
    user_id: 'user-1',
    phone_number_id: 'phone-1',
    twilio_call_sid: 'CA1234567891',
    caller_number: '+1 (555) 987-6543',
    caller_name: 'Sarah Johnson',
    call_status: 'completed',
    call_direction: 'inbound',
    call_duration: 95,
    recording_url: 'https://example.com/recording2.mp3',
    recording_sid: 'RE1234567891',
    transcription_text: 'I\'d like to get a quote for installing new fixtures in my bathroom. When would be a good time to have someone come take a look?',
    transcription_confidence: 0.88,
    ai_processing_status: 'completed',
    main_topic: 'Bathroom Fixture Installation Quote',
    call_summary: 'Customer Sarah Johnson requesting quote for bathroom fixture installation. Needs scheduling for assessment visit.',
    sentiment_analysis: { overall: 'positive', urgency: 'medium' },
    urgency_level: 'medium',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updated_at: new Date().toISOString(),
    processed_at: new Date(Date.now() - 1000 * 60 * 60 * 23.5).toISOString(),
    email_sent_at: new Date(Date.now() - 1000 * 60 * 60 * 23.4).toISOString(),
  },
  {
    id: '3',
    user_id: 'user-1',
    phone_number_id: 'phone-1',
    twilio_call_sid: 'CA1234567892',
    caller_number: '+1 (555) 555-0123',
    caller_name: null,
    call_status: 'completed',
    call_direction: 'inbound',
    call_duration: 45,
    recording_url: null,
    recording_sid: null,
    transcription_text: 'Hello, is this ABC Plumbing? I was calling to follow up on my service request from last week.',
    transcription_confidence: 0.85,
    ai_processing_status: 'completed',
    main_topic: 'Follow-up on Previous Service',
    call_summary: 'Customer following up on previous service request. Short call requesting status update.',
    sentiment_analysis: { overall: 'neutral', urgency: 'low' },
    urgency_level: 'low',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    updated_at: new Date().toISOString(),
    processed_at: new Date(Date.now() - 1000 * 60 * 60 * 71.5).toISOString(),
    email_sent_at: new Date(Date.now() - 1000 * 60 * 60 * 71.4).toISOString(),
  },
  {
    id: '4',
    user_id: 'user-1',
    phone_number_id: 'phone-1',
    twilio_call_sid: 'CA1234567893',
    caller_number: '+1 (555) 111-2222',
    caller_name: 'Mike Rodriguez',
    call_status: 'completed',
    call_direction: 'inbound',
    call_duration: 220,
    recording_url: 'https://example.com/recording4.mp3',
    recording_sid: 'RE1234567893',
    transcription_text: 'This is an emergency! My basement is flooding and I think it\'s coming from the main water line. I need someone here immediately!',
    transcription_confidence: 0.95,
    ai_processing_status: 'completed',
    main_topic: 'Emergency Water Line Break',
    call_summary: 'EMERGENCY: Customer Mike Rodriguez has flooding in basement from main water line. Requires immediate response.',
    sentiment_analysis: { overall: 'distressed', urgency: 'emergency' },
    urgency_level: 'emergency',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(), // 1 week ago
    updated_at: new Date().toISOString(),
    processed_at: new Date(Date.now() - 1000 * 60 * 60 * 167.9).toISOString(),
    email_sent_at: new Date(Date.now() - 1000 * 60 * 60 * 167.8).toISOString(),
  }
];

export default function CallsPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Simulate API loading with retry logic
  useEffect(() => {
    const loadCalls = async (attempt: number = 0) => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API delay with potential failure
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate random failures for testing error handling
            if (Math.random() < 0.1 && attempt < maxRetries) {
              reject(new Error('Network error'));
            } else {
              resolve(void 0);
            }
          }, 1000 + (attempt * 500)); // Progressively longer delays for retries
        });
        
        setCalls(mockCalls);
        setRetryCount(0); // Reset retry count on success
      } catch (err) {
        console.error('Error loading calls:', err);
        
        if (attempt < maxRetries) {
          setRetryCount(attempt + 1);
          setTimeout(() => loadCalls(attempt + 1), 2000); // Wait 2 seconds before retry
        } else {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(`Failed to load calls after ${maxRetries + 1} attempts: ${errorMessage}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCalls();
  }, [maxRetries]);

  const handleRefresh = async () => {
    setError(null);
    setRetryCount(0);
    setIsLoading(true);
    
    try {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCalls(mockCalls);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to refresh calls: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Call History</h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-lg">
              Review your calls, transcripts, and AI extractions
            </p>
            {retryCount > 0 && (
              <div className="flex items-center gap-1 text-sm text-warning">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>Retrying... ({retryCount}/{maxRetries})</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="flat"
            onPress={handleRefresh}
            isLoading={isLoading}
            startContent={
              !isLoading && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              )
            }
            className="hover:scale-105 transition-transform"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                <p className="text-2xl font-bold text-foreground">{calls.length}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processed</p>
                <p className="text-2xl font-bold text-foreground">
                  {calls.filter(call => call.ai_processing_status === 'completed').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emergency</p>
                <p className="text-2xl font-bold text-foreground">
                  {calls.filter(call => call.urgency_level === 'emergency').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold text-foreground">
                  {calls.length > 0 
                    ? `${Math.round(calls.reduce((acc, call) => acc + (call.call_duration || 0), 0) / calls.length / 60)}m`
                    : '0m'
                  }
                </p>
              </div>
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call History List */}
      <CallHistoryList
        calls={calls}
        isLoading={isLoading}
        error={error}
        onRefresh={handleRefresh}
      />
    </div>
  );
}