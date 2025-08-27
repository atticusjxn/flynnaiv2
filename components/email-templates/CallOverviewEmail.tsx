import React from 'react';
import {
  Section,
  Text,
  Link,
  Row,
  Column,
  Hr,
} from '@react-email/components';
import BaseEmailLayout from './BaseEmailLayout';
import EventCard, { ExtractedEvent } from './EventCard';
import { getIndustryConfiguration } from '@/lib/industry/configurations';

export interface CallOverviewEmailProps {
  companyName: string;
  industry: string;
  callSummary: {
    callerPhone: string;
    callerName?: string;
    duration: number;
    timestamp: string;
    callSid: string;
  };
  extractedEvents: ExtractedEvent[];
  transcriptionSnippet?: string;
  callId: string;
  userEmail: string;
  dashboardUrl?: string;
}

export default function CallOverviewEmail({
  companyName,
  industry,
  callSummary,
  extractedEvents,
  transcriptionSnippet,
  callId,
  userEmail,
  dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flynn.ai',
}: CallOverviewEmailProps) {
  const industryConfig = getIndustryConfiguration(industry);
  const hasEvents = extractedEvents.length > 0;
  const hasUrgentEvents = extractedEvents.some(e => e.urgency === 'emergency' || e.urgency === 'high');
  const terminology = industryConfig.terminology;

  // Generate preview text
  const previewText = hasEvents
    ? `${extractedEvents.length} new ${terminology.appointment}${extractedEvents.length > 1 ? 's' : ''} from ${callSummary.callerPhone}`
    : `New call summary from ${callSummary.callerPhone}`;

  return (
    <BaseEmailLayout
      preview={previewText}
      companyName={companyName}
      industry={industry}
      primaryColor={industryConfig.colors.primary}
    >
      {/* Urgent Banner */}
      {hasUrgentEvents && (
        <Section style={urgentBanner}>
          <Text style={urgentBannerText}>
            🚨 URGENT: Some appointments require immediate attention
          </Text>
        </Section>
      )}

      {/* Call Summary Card */}
      <Section style={callSummaryCard}>
        <Text style={sectionTitle}>📞 Call Summary</Text>
        
        <Row style={callInfoGrid}>
          <Column style={callInfoColumn}>
            <div style={callInfoItem}>
              <Text style={callInfoLabel}>FROM</Text>
              <Text style={callInfoValue}>
                {callSummary.callerName || 'Unknown Caller'}
              </Text>
              <Text style={callInfoSubValue}>
                {callSummary.callerPhone}
              </Text>
            </div>
          </Column>
          
          <Column style={callInfoColumn}>
            <div style={callInfoItem}>
              <Text style={callInfoLabel}>DURATION</Text>
              <Text style={callInfoValue}>
                {formatDuration(callSummary.duration)}
              </Text>
            </div>
          </Column>
          
          <Column style={callInfoColumn}>
            <div style={callInfoItem}>
              <Text style={callInfoLabel}>PROCESSED</Text>
              <Text style={callInfoValue}>
                {formatTimestamp(callSummary.timestamp)}
              </Text>
            </div>
          </Column>
        </Row>

        {/* Transcription Snippet */}
        {transcriptionSnippet && (
          <Section style={transcriptionSection}>
            <Text style={transcriptionLabel}>Call Excerpt:</Text>
            <Text style={transcriptionText}>
              "{transcriptionSnippet}{transcriptionSnippet.length >= 200 ? '...' : ''}"
            </Text>
          </Section>
        )}
      </Section>

      {/* Events Section */}
      {hasEvents ? (
        <Section style={eventsSection}>
          <Text style={sectionTitle}>
            🎯 {terminology.events_title} ({extractedEvents.length})
          </Text>
          <Text style={sectionSubtitle}>
            AI has identified the following {terminology.appointment}s from your call:
          </Text>

          {extractedEvents.map((event, index) => (
            <EventCard
              key={index}
              event={event}
              industry={industry}
              terminology={terminology}
              primaryColor={industryConfig.colors.primary}
              callId={callId}
            />
          ))}
          
          {/* Batch Actions */}
          {extractedEvents.length > 1 && (
            <Section style={batchActionsSection}>
              <Text style={batchActionsTitle}>Bulk Actions:</Text>
              <Row>
                <Column>
                  <Link
                    href={`${dashboardUrl}/events/batch?call=${callId}&action=confirm`}
                    style={{...batchButton, ...confirmAllButton}}
                  >
                    ✓ Confirm All Appointments
                  </Link>
                </Column>
                <Column>
                  <Link
                    href={`${dashboardUrl}/events/batch?call=${callId}&action=calendar`}
                    style={{...batchButton, ...calendarButton}}
                  >
                    📅 Add to Calendar
                  </Link>
                </Column>
              </Row>
            </Section>
          )}
        </Section>
      ) : (
        <Section style={noEventsSection}>
          <Text style={noEventsTitle}>
            No specific appointments were detected
          </Text>
          <Text style={noEventsText}>
            The call has been processed and transcribed. While no concrete appointments 
            were identified, you can review the full transcript and call details in your dashboard.
          </Text>
          <Text style={noEventsSubtext}>
            Common reasons: General inquiry, information request, or scheduling discussion without firm commitment.
          </Text>
        </Section>
      )}

      <Hr style={separator} />

      {/* Action Buttons */}
      <Section style={mainActionsSection}>
        <Text style={actionsTitle}>What's Next?</Text>
        <Row>
          <Column>
            <Link
              href={`${dashboardUrl}/dashboard`}
              style={{...mainActionButton, ...dashboardButton}}
            >
              📊 View Dashboard
            </Link>
          </Column>
          <Column>
            <Link
              href={`${dashboardUrl}/calls/${callId}`}
              style={{...mainActionButton, ...transcriptButton}}
            >
              🎧 Full Transcript
            </Link>
          </Column>
        </Row>
        
        {hasEvents && (
          <Row style={{marginTop: '12px'}}>
            <Column>
              <Link
                href={`${dashboardUrl}/calendar/sync?call=${callId}`}
                style={{...mainActionButton, ...syncButton}}
              >
                📅 Sync to Calendar
              </Link>
            </Column>
            <Column>
              <Link
                href={`mailto:${userEmail}?subject=Re: ${terminology.appointment} Request&body=Hi, I received your ${terminology.appointment} request...`}
                style={{...mainActionButton, ...emailButton}}
              >
                📧 Reply to Caller
              </Link>
            </Column>
          </Row>
        )}
      </Section>

      {/* Industry-Specific Footer */}
      <Section style={industryFooterSection}>
        <Text style={industryFooterText}>
          {getIndustryHelpText(industry, terminology)}
        </Text>
      </Section>
    </BaseEmailLayout>
  );
}

// Utility Functions
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function getIndustryHelpText(industry: string, terminology: any): string {
  const helpTexts = {
    plumbing: `💡 Pro Tip: Emergency ${terminology.service_call}s are highlighted in red. Click any service request to confirm timing and add your availability.`,
    real_estate: `🏠 Pro Tip: High-priority ${terminology.appointment}s often indicate serious buyers. Use the quick actions to respond promptly and maintain momentum.`,
    legal: `⚖️ Pro Tip: Client ${terminology.appointment}s are automatically classified by urgency. Review confidentiality requirements before confirming details.`,
    medical: `🏥 Pro Tip: Urgent ${terminology.appointment}s require immediate attention. Please verify patient information before adding to your schedule.`,
    general: `💼 Pro Tip: Review all appointment details carefully and confirm availability before responding to ensure accurate scheduling.`,
  };
  return (helpTexts as any)[industry] || helpTexts.general;
}

// Styles
const urgentBanner = {
  backgroundColor: '#dc2626',
  padding: '12px 20px',
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const urgentBannerText = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const callSummaryCard = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 16px 0',
  borderBottom: '2px solid #e5e7eb',
  paddingBottom: '8px',
};

const sectionSubtitle = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 20px 0',
  lineHeight: '1.5',
};

const callInfoGrid = {
  marginBottom: '16px',
};

const callInfoColumn = {
  verticalAlign: 'top' as const,
  paddingRight: '16px',
};

const callInfoItem = {
  marginBottom: '12px',
};

const callInfoLabel = {
  fontSize: '11px',
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px 0',
  fontWeight: '500',
};

const callInfoValue = {
  fontSize: '14px',
  color: '#111827',
  fontWeight: '600',
  margin: '0',
};

const callInfoSubValue = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '2px 0 0 0',
};

const transcriptionSection = {
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  padding: '12px',
  marginTop: '16px',
};

const transcriptionLabel = {
  fontSize: '12px',
  color: '#374151',
  fontWeight: '500',
  margin: '0 0 6px 0',
};

const transcriptionText = {
  fontSize: '13px',
  color: '#4b5563',
  fontStyle: 'italic',
  margin: '0',
  lineHeight: '1.4',
};

const eventsSection = {
  marginBottom: '24px',
};

const batchActionsSection = {
  backgroundColor: '#f9fafb',
  border: '1px solid #f3f4f6',
  borderRadius: '6px',
  padding: '16px',
  marginTop: '20px',
};

const batchActionsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  margin: '0 0 12px 0',
};

const batchButton = {
  display: 'inline-block',
  padding: '10px 16px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: '500',
  textAlign: 'center' as const,
  width: '100%',
  boxSizing: 'border-box' as const,
  marginRight: '8px',
};

const confirmAllButton = {
  backgroundColor: '#10b981',
  color: '#ffffff',
};

const calendarButton = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
};

const noEventsSection = {
  textAlign: 'center' as const,
  padding: '40px 20px',
  backgroundColor: '#fafbfc',
  borderRadius: '8px',
  marginBottom: '24px',
  border: '1px solid #f1f3f4',
};

const noEventsTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#374151',
  margin: '0 0 12px 0',
};

const noEventsText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 12px 0',
  lineHeight: '1.5',
};

const noEventsSubtext = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0',
  fontStyle: 'italic',
};

const separator = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const mainActionsSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const actionsTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#374151',
  margin: '0 0 16px 0',
};

const mainActionButton = {
  display: 'inline-block',
  padding: '12px 20px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
  textAlign: 'center' as const,
  width: '100%',
  boxSizing: 'border-box' as const,
  marginBottom: '8px',
};

const dashboardButton = {
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  marginRight: '8px',
};

const transcriptButton = {
  backgroundColor: '#ffffff',
  color: '#374151',
  border: '1px solid #d1d5db',
};

const syncButton = {
  backgroundColor: '#059669',
  color: '#ffffff',
  marginRight: '8px',
};

const emailButton = {
  backgroundColor: '#f59e0b',
  color: '#ffffff',
};

const industryFooterSection = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  padding: '16px',
  textAlign: 'center' as const,
};

const industryFooterText = {
  fontSize: '13px',
  color: '#4b5563',
  margin: '0',
  lineHeight: '1.4',
};