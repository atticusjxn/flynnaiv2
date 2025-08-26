# Flynn.ai v2 Email Template System

## Overview
Professional, industry-adaptive email templates built with React Email and Resend. The system generates call overview emails with event cards, calendar attachments, and deep-linking to the dashboard.

## Architecture

### Technology Stack
- **React Email**: Component-based email templates
- **Resend**: Email delivery service
- **Tailwind CSS**: Styling (email-safe subset)
- **ICS Generator**: Calendar file attachments
- **Dynamic Content**: Industry-aware templates

## Email Template Components

### 1. Base Email Layout Component

```tsx
// components/email-templates/BaseEmailLayout.tsx
import { Html, Head, Body, Container, Section, Text } from '@react-email/components';

interface BaseEmailLayoutProps {
  children: React.ReactNode;
  previewText: string;
  companyName: string;
  industry: string;
}

export default function BaseEmailLayout({ 
  children, 
  previewText, 
  companyName,
  industry 
}: BaseEmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={logoStyle}>Flynn.ai</Text>
            <Text style={companyStyle}>{companyName}</Text>
          </Section>
          
          {/* Content */}
          <Section style={contentStyle}>
            {children}
          </Section>
          
          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Powered by Flynn.ai • Manage this call in your dashboard
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  backgroundColor: '#f8fafc',
  margin: 0,
  padding: '20px 0',
};

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const headerStyle = {
  backgroundColor: '#1e40af',
  padding: '24px',
  textAlign: 'center' as const,
};

const logoStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 8px 0',
};

const companyStyle = {
  fontSize: '16px',
  color: '#e5e7eb',
  margin: 0,
};

const contentStyle = {
  padding: '32px 24px',
};

const footerStyle = {
  backgroundColor: '#f1f5f9',
  padding: '16px 24px',
  textAlign: 'center' as const,
};

const footerTextStyle = {
  fontSize: '12px',
  color: '#64748b',
  margin: 0,
};
```

### 2. Call Overview Email Template

```tsx
// components/email-templates/CallOverviewEmail.tsx
import { Section, Text, Button, Hr } from '@react-email/components';
import BaseEmailLayout from './BaseEmailLayout';
import EventCard from './EventCard';
import CallSummaryCard from './CallSummaryCard';

interface CallOverviewEmailProps {
  companyName: string;
  industry: string;
  mainTopic: string;
  callSummary: string;
  callerName: string;
  callerNumber: string;
  callDuration: number;
  events: Array<{
    id: string;
    title: string;
    eventType: string;
    proposedDateTime: string | null;
    location: string;
    description: string;
    urgencyLevel: string;
    priceEstimate?: number;
    customerName: string;
  }>;
  dashboardUrl: string;
  transcriptUrl: string;
}

export default function CallOverviewEmail({
  companyName,
  industry,
  mainTopic,
  callSummary,
  callerName,
  callerNumber,
  callDuration,
  events,
  dashboardUrl,
  transcriptUrl
}: CallOverviewEmailProps) {
  const previewText = `${mainTopic} - ${events.length} ${events.length === 1 ? 'event' : 'events'} extracted`;
  
  return (
    <BaseEmailLayout 
      previewText={previewText}
      companyName={companyName}
      industry={industry}
    >
      {/* Call Summary */}
      <CallSummaryCard
        mainTopic={mainTopic}
        callSummary={callSummary}
        callerName={callerName}
        callerNumber={callerNumber}
        callDuration={callDuration}
        industry={industry}
      />
      
      <Hr style={hrStyle} />
      
      {/* Events Section */}
      <Section>
        <Text style={sectionHeaderStyle}>
          {getEventsSectionTitle(events.length, industry)}
        </Text>
        
        {events.map((event, index) => (
          <EventCard 
            key={event.id}
            event={event}
            industry={industry}
            isLast={index === events.length - 1}
          />
        ))}
      </Section>
      
      <Hr style={hrStyle} />
      
      {/* Action Buttons */}
      <Section style={actionsStyle}>
        <Button href={dashboardUrl} style={primaryButtonStyle}>
          Manage Events in Dashboard
        </Button>
        
        <Button href={transcriptUrl} style={secondaryButtonStyle}>
          View Full Transcript
        </Button>
      </Section>
      
      {/* Industry-specific footer */}
      <Section>
        <Text style={helpTextStyle}>
          {getIndustrySpecificHelpText(industry)}
        </Text>
      </Section>
    </BaseEmailLayout>
  );
}

function getEventsSectionTitle(eventCount: number, industry: string): string {
  const eventWord = getIndustryEventWord(industry);
  return `${eventCount} ${eventWord}${eventCount !== 1 ? 's' : ''} Found`;
}

function getIndustryEventWord(industry: string): string {
  const industryWords = {
    plumbing: 'Service Request',
    real_estate: 'Appointment',
    legal: 'Consultation',
    medical: 'Appointment',
    sales: 'Meeting',
    consulting: 'Session'
  };
  return industryWords[industry as keyof typeof industryWords] || 'Event';
}

function getIndustrySpecificHelpText(industry: string): string {
  const helpTexts = {
    plumbing: 'Click on any service request to confirm timing, add notes, or send customer confirmations.',
    real_estate: 'Manage your showings and client meetings directly from your dashboard.',
    legal: 'All consultations are flagged for your review. Update billing and case information as needed.',
    medical: 'Remember to verify patient information and insurance details before confirming appointments.',
    sales: 'Track your sales pipeline and send meeting confirmations to prospects.',
    consulting: 'Review project scope and send professional confirmations to clients.'
  };
  return helpTexts[industry as keyof typeof helpTexts] || 'Click any event to manage details and send confirmations.';
}

const sectionHeaderStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 16px 0',
};

const hrStyle = {
  border: 'none',
  borderTop: '1px solid #e5e7eb',
  margin: '24px 0',
};

const actionsStyle = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const primaryButtonStyle = {
  backgroundColor: '#1e40af',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: '600',
  display: 'inline-block',
  margin: '0 8px 12px 8px',
};

const secondaryButtonStyle = {
  backgroundColor: '#6b7280',
  color: '#ffffff',
  padding: '10px 20px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '0 8px 12px 8px',
};

const helpTextStyle = {
  fontSize: '14px',
  color: '#6b7280',
  fontStyle: 'italic',
  textAlign: 'center' as const,
  margin: '16px 0 0 0',
};
```

### 3. Event Card Component

```tsx
// components/email-templates/EventCard.tsx
import { Section, Text, Button } from '@react-email/components';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    eventType: string;
    proposedDateTime: string | null;
    location: string;
    description: string;
    urgencyLevel: string;
    priceEstimate?: number;
    customerName: string;
  };
  industry: string;
  isLast: boolean;
}

export default function EventCard({ event, industry, isLast }: EventCardProps) {
  const urgencyColors = {
    low: '#10b981',
    medium: '#f59e0b', 
    high: '#ef4444',
    emergency: '#dc2626'
  };
  
  const urgencyColor = urgencyColors[event.urgencyLevel as keyof typeof urgencyColors];
  
  return (
    <Section style={{
      ...eventCardStyle,
      marginBottom: isLast ? 0 : '16px',
      borderLeft: `4px solid ${urgencyColor}`
    }}>
      {/* Event Header */}
      <Section style={eventHeaderStyle}>
        <Text style={eventTitleStyle}>{event.title}</Text>
        <Text style={eventTypeStyle}>
          {formatEventType(event.eventType, industry)} • {formatUrgency(event.urgencyLevel)}
        </Text>
      </Section>
      
      {/* Event Details */}
      <Section style={eventDetailsStyle}>
        {event.proposedDateTime && (
          <Text style={detailStyle}>
            📅 {formatDateTime(event.proposedDateTime)}
          </Text>
        )}
        
        {event.location && (
          <Text style={detailStyle}>
            📍 {event.location}
          </Text>
        )}
        
        {event.customerName && (
          <Text style={detailStyle}>
            👤 {event.customerName}
          </Text>
        )}
        
        {event.priceEstimate && (
          <Text style={detailStyle}>
            💰 Estimated: ${event.priceEstimate}
          </Text>
        )}
        
        {event.description && (
          <Text style={descriptionStyle}>
            {event.description}
          </Text>
        )}
      </Section>
      
      {/* Quick Actions */}
      <Section style={quickActionsStyle}>
        <Button 
          href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/events/${event.id}?action=confirm`}
          style={confirmButtonStyle}
        >
          ✅ Confirm
        </Button>
        
        <Button 
          href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/events/${event.id}?action=edit`}
          style={editButtonStyle}
        >
          ✏️ Edit
        </Button>
        
        <Button 
          href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/events/${event.id}?action=followup`}
          style={followupButtonStyle}
        >
          📞 Follow Up
        </Button>
      </Section>
    </Section>
  );
}

function formatEventType(eventType: string, industry: string): string {
  const typeMap = {
    service_call: industry === 'plumbing' ? 'Service Call' : 'Service Request',
    meeting: 'Meeting',
    appointment: industry === 'medical' ? 'Patient Appointment' : 'Appointment',
    demo: 'Demo',
    follow_up: 'Follow-up',
    quote: 'Quote',
    consultation: industry === 'legal' ? 'Legal Consultation' : 'Consultation',
    inspection: 'Inspection',
    emergency: 'Emergency'
  };
  
  return typeMap[eventType as keyof typeof typeMap] || eventType;
}

function formatUrgency(urgencyLevel: string): string {
  const urgencyMap = {
    low: 'Low Priority',
    medium: 'Normal',
    high: 'High Priority',
    emergency: 'EMERGENCY'
  };
  
  return urgencyMap[urgencyLevel as keyof typeof urgencyMap] || urgencyLevel;
}

function formatDateTime(dateTime: string): string {
  const date = new Date(dateTime);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

const eventCardStyle = {
  backgroundColor: '#f8fafc',
  borderRadius: '6px',
  padding: '16px',
  borderLeft: '4px solid #6b7280',
};

const eventHeaderStyle = {
  marginBottom: '12px',
};

const eventTitleStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 4px 0',
};

const eventTypeStyle = {
  fontSize: '12px',
  color: '#6b7280',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  margin: 0,
};

const eventDetailsStyle = {
  marginBottom: '16px',
};

const detailStyle = {
  fontSize: '14px',
  color: '#374151',
  margin: '0 0 4px 0',
};

const descriptionStyle = {
  fontSize: '14px',
  color: '#4b5563',
  fontStyle: 'italic',
  margin: '8px 0 0 0',
  padding: '8px',
  backgroundColor: '#ffffff',
  borderRadius: '4px',
};

const quickActionsStyle = {
  textAlign: 'center' as const,
};

const confirmButtonStyle = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  padding: '8px 12px',
  borderRadius: '4px',
  textDecoration: 'none',
  fontSize: '12px',
  fontWeight: '600',
  display: 'inline-block',
  margin: '0 4px',
};

const editButtonStyle = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '8px 12px',
  borderRadius: '4px',
  textDecoration: 'none',
  fontSize: '12px',
  fontWeight: '600',
  display: 'inline-block',
  margin: '0 4px',
};

const followupButtonStyle = {
  backgroundColor: '#f59e0b',
  color: '#ffffff',
  padding: '8px 12px',
  borderRadius: '4px',
  textDecoration: 'none',
  fontSize: '12px',
  fontWeight: '600',
  display: 'inline-block',
  margin: '0 4px',
};
```

### 4. Call Summary Card Component

```tsx
// components/email-templates/CallSummaryCard.tsx
import { Section, Text } from '@react-email/components';

interface CallSummaryCardProps {
  mainTopic: string;
  callSummary: string;
  callerName: string;
  callerNumber: string;
  callDuration: number;
  industry: string;
}

export default function CallSummaryCard({
  mainTopic,
  callSummary,
  callerName,
  callerNumber,
  callDuration,
  industry
}: CallSummaryCardProps) {
  return (
    <Section style={summaryCardStyle}>
      <Text style={topicStyle}>{mainTopic}</Text>
      
      <Section style={metaInfoStyle}>
        <Text style={metaTextStyle}>
          📞 {callerName || 'Unknown Caller'} • {callerNumber}
        </Text>
        <Text style={metaTextStyle}>
          ⏱️ {formatDuration(callDuration)} • {formatTimestamp(new Date())}
        </Text>
      </Section>
      
      <Text style={summaryTextStyle}>{callSummary}</Text>
      
      {getIndustryInsight(industry, callSummary) && (
        <Section style={insightStyle}>
          <Text style={insightTextStyle}>
            💡 {getIndustryInsight(industry, callSummary)}
          </Text>
        </Section>
      )}
    </Section>
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')} min`;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function getIndustryInsight(industry: string, summary: string): string | null {
  const summaryLower = summary.toLowerCase();
  
  switch (industry) {
    case 'plumbing':
      if (summaryLower.includes('emergency') || summaryLower.includes('water damage')) {
        return 'Emergency service - prioritize immediate response';
      }
      if (summaryLower.includes('estimate') || summaryLower.includes('quote')) {
        return 'Quote requested - consider scheduling site visit';
      }
      break;
      
    case 'real_estate':
      if (summaryLower.includes('pre-approved') || summaryLower.includes('cash buyer')) {
        return 'Qualified buyer - high priority showing';
      }
      if (summaryLower.includes('first-time buyer')) {
        return 'First-time buyer - may need additional guidance';
      }
      break;
      
    case 'legal':
      if (summaryLower.includes('deadline') || summaryLower.includes('court')) {
        return 'Time-sensitive legal matter - review urgently';
      }
      break;
      
    case 'medical':
      if (summaryLower.includes('pain') || summaryLower.includes('urgent')) {
        return 'Urgent medical concern - consider priority scheduling';
      }
      break;
      
    case 'sales':
      if (summaryLower.includes('budget approved') || summaryLower.includes('ready to buy')) {
        return 'Hot prospect - follow up quickly';
      }
      break;
  }
  
  return null;
}

const summaryCardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const topicStyle = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#1f2937',
  margin: '0 0 12px 0',
};

const metaInfoStyle = {
  marginBottom: '16px',
};

const metaTextStyle = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 4px 0',
};

const summaryTextStyle = {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '1.5',
  margin: '0 0 16px 0',
};

const insightStyle = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '6px',
  padding: '12px',
};

const insightTextStyle = {
  fontSize: '14px',
  color: '#92400e',
  fontWeight: '500',
  margin: 0,
};
```

## Email Sending Service

### Email Service Implementation

```typescript
// lib/email/EmailService.ts
import { Resend } from 'resend';
import { render } from '@react-email/render';
import CallOverviewEmail from '@/components/email-templates/CallOverviewEmail';
import { generateICSFile } from '@/lib/calendar/icsGenerator';

export class EmailService {
  private resend: Resend;
  
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }
  
  async sendCallOverviewEmail(emailData: CallOverviewEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Generate email HTML
      const emailHtml = render(CallOverviewEmail(emailData));
      
      // Generate ICS attachments for events with confirmed times
      const attachments = await this.generateEventAttachments(emailData.events);
      
      // Generate subject line based on industry and content
      const subject = this.generateSubjectLine(emailData);
      
      // Send email via Resend
      const result = await this.resend.emails.send({
        from: `${emailData.companyName} <noreply@${process.env.EMAIL_DOMAIN}>`,
        to: emailData.userEmail,
        subject: subject,
        html: emailHtml,
        attachments: attachments,
        headers: {
          'X-Flynn-Call-ID': emailData.callId,
          'X-Flynn-User-ID': emailData.userId,
        },
        tags: [
          { name: 'type', value: 'call-overview' },
          { name: 'industry', value: emailData.industry },
          { name: 'event-count', value: emailData.events.length.toString() }
        ]
      });
      
      return {
        success: true,
        messageId: result.data?.id
      };
      
    } catch (error) {
      console.error('Failed to send call overview email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  private generateSubjectLine(emailData: CallOverviewEmailData): string {
    const { mainTopic, events, industry, callerName } = emailData;
    
    // Use main topic if available and concise
    if (mainTopic && mainTopic.length <= 50) {
      return `${mainTopic} - ${callerName}`;
    }
    
    // Fallback to industry-specific format
    const industryFormats = {
      plumbing: `Service Request from ${callerName}`,
      real_estate: `Property Inquiry from ${callerName}`,
      legal: `Legal Consultation Request - ${callerName}`,
      medical: `Appointment Request from ${callerName}`,
      sales: `Sales Inquiry from ${callerName}`,
      consulting: `Consultation Request - ${callerName}`
    };
    
    return industryFormats[industry as keyof typeof industryFormats] || 
           `New Call from ${callerName}`;
  }
  
  private async generateEventAttachments(events: EventData[]): Promise<Array<{ filename: string; content: string }>> {
    const attachments = [];
    
    for (const event of events) {
      if (event.proposedDateTime) {
        const icsContent = generateICSFile({
          title: event.title,
          description: event.description,
          startDate: new Date(event.proposedDateTime),
          endDate: new Date(new Date(event.proposedDateTime).getTime() + (event.durationMinutes || 60) * 60000),
          location: event.location,
          uid: event.id
        });
        
        attachments.push({
          filename: `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`,
          content: icsContent
        });
      }
    }
    
    return attachments;
  }
}

interface CallOverviewEmailData {
  callId: string;
  userId: string;
  userEmail: string;
  companyName: string;
  industry: string;
  mainTopic: string;
  callSummary: string;
  callerName: string;
  callerNumber: string;
  callDuration: number;
  events: EventData[];
  dashboardUrl: string;
  transcriptUrl: string;
}

interface EventData {
  id: string;
  title: string;
  eventType: string;
  proposedDateTime: string | null;
  durationMinutes: number;
  location: string;
  description: string;
  urgencyLevel: string;
  priceEstimate?: number;
  customerName: string;
}
```

## Industry-Specific Template Variations

### Template Selection Logic

```typescript
// lib/email/templateSelector.ts
export function selectEmailTemplate(industry: string, eventTypes: string[]) {
  // Base template for all industries
  let templateComponent = CallOverviewEmail;
  
  // Industry-specific customizations
  switch (industry) {
    case 'plumbing':
      // Emphasize urgency indicators and service locations
      break;
    case 'real_estate':
      // Focus on property details and showing times
      break;
    case 'legal':
      // Highlight confidentiality and case types
      break;
    case 'medical':
      // Emphasize appointment details and patient privacy
      break;
    case 'sales':
      // Focus on lead qualification and follow-up timing
      break;
    default:
      // Use base template
      break;
  }
  
  return templateComponent;
}
```

## Email Testing & Preview

### Development Preview System

```typescript
// app/api/email/preview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import CallOverviewEmail from '@/components/email-templates/CallOverviewEmail';

export async function GET(request: NextRequest) {
  // Sample data for preview
  const sampleData = {
    companyName: 'Smith Plumbing Services',
    industry: 'plumbing',
    mainTopic: 'Kitchen Sink Leak Repair',
    callSummary: 'Customer has a leaking kitchen sink that needs immediate attention. Water is damaging the cabinet below.',
    callerName: 'John Doe',
    callerNumber: '+1 (555) 123-4567',
    callDuration: 180,
    events: [
      {
        id: 'event-1',
        title: 'Kitchen Sink Repair',
        eventType: 'service_call',
        proposedDateTime: '2025-01-16T14:00:00Z',
        location: '123 Main Street, Anytown, ST 12345',
        description: 'Fix leaking kitchen sink under cabinet',
        urgencyLevel: 'high',
        priceEstimate: 150,
        customerName: 'John Doe'
      }
    ],
    dashboardUrl: 'https://flynn.ai/dashboard/calls/123',
    transcriptUrl: 'https://flynn.ai/dashboard/calls/123/transcript'
  };
  
  const html = render(CallOverviewEmail(sampleData));
  
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
```

## Email Analytics & Tracking

### Email Performance Tracking

```typescript
// lib/email/analytics.ts
export class EmailAnalytics {
  async trackEmailSent(emailData: {
    messageId: string;
    callId: string;
    userId: string;
    eventCount: number;
    industry: string;
  }) {
    // Track email send events
    await this.recordEvent('email.sent', emailData);
  }
  
  async trackEmailOpened(messageId: string) {
    // Track email opens via Resend webhooks
    await this.recordEvent('email.opened', { messageId });
  }
  
  async trackLinkClicked(messageId: string, linkType: 'dashboard' | 'event' | 'transcript') {
    // Track clicks on email links
    await this.recordEvent('email.link_clicked', { messageId, linkType });
  }
  
  private async recordEvent(eventType: string, data: any) {
    // Store analytics data for performance monitoring
    console.log(`Email Analytics: ${eventType}`, data);
  }
}
```

## Email Deliverability Best Practices

### Configuration Requirements

```typescript
// Email deliverability configuration
export const EMAIL_CONFIG = {
  // Domain Authentication
  domain: process.env.EMAIL_DOMAIN,
  
  // SPF Record: "v=spf1 include:_spf.resend.com ~all"
  // DKIM: Configured via Resend dashboard
  // DMARC: "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
  
  // Sender Reputation
  fromName: 'Flynn.ai Notifications',
  replyTo: 'support@flynn.ai',
  
  // Content Guidelines
  maxSubjectLength: 60,
  optimalEmailLength: 1000, // characters
  
  // Rate Limiting
  maxEmailsPerHour: 1000,
  maxEventsPerEmail: 10,
  
  // Compliance
  includeUnsubscribe: true,
  respectUserPreferences: true
};
```

## Mobile Email Optimization

### Mobile-First Design Principles

1. **Single Column Layout**: All email templates use single-column design
2. **Touch-Friendly Buttons**: Minimum 44px touch targets
3. **Readable Fonts**: 14px minimum font size
4. **Responsive Images**: Max-width 100% with proper scaling
5. **Progressive Enhancement**: Graceful degradation for older clients

### Email Client Testing

Test templates across major email clients:
- **Mobile**: iOS Mail, Gmail Mobile, Outlook Mobile
- **Desktop**: Outlook 2016+, Apple Mail, Gmail Web
- **Web**: Yahoo Mail, AOL Mail

This email template system provides professional, industry-adaptive communications that enhance the Flynn.ai user experience while maintaining excellent deliverability and mobile optimization.