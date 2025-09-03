import React from 'react';
import { Section, Text, Link, Row, Column } from '@react-email/components';

export interface ExtractedEvent {
  id?: string;
  title: string;
  description: string;
  type: string;
  proposed_datetime?: string;
  duration_minutes?: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  location?: string;
  service_address?: string;
  service_type?: string;
  price_estimate?: string;
  confidence_score: number;
  status: string;
}

interface EventCardProps {
  event: ExtractedEvent;
  industry: string;
  terminology: Record<string, string>;
  primaryColor: string;
  callId?: string;
}

export default function EventCard({
  event,
  industry,
  terminology,
  primaryColor,
  callId = '',
}: EventCardProps) {
  const urgencyConfig = getUrgencyConfig(event.urgency);
  const confidencePercent = Math.round(event.confidence_score * 100);
  const confidenceColor = getConfidenceColor(event.confidence_score);

  return (
    <Section
      style={{
        ...eventCard,
        ...(event.urgency === 'emergency' || event.urgency === 'high'
          ? urgentCard
          : {}),
      }}
    >
      {/* Urgency Badge */}
      <div style={{ ...urgencyBadge, ...urgencyConfig.style }}>
        {urgencyConfig.label}
      </div>

      {/* Event Type */}
      <Text
        style={{
          ...eventType,
          backgroundColor: `${primaryColor}22`,
          color: primaryColor,
        }}
      >
        {terminology[event.type] || event.type.replace('_', ' ').toUpperCase()}
      </Text>

      {/* Event Title */}
      <Text style={eventTitle}>{event.title}</Text>

      {/* Event Details Grid */}
      <Row style={detailsGrid}>
        <Column style={detailColumn}>
          {event.customer_name && (
            <div style={detailItem}>
              <Text style={detailLabel}>CUSTOMER</Text>
              <Text style={detailValue}>{event.customer_name}</Text>
            </div>
          )}

          {event.customer_phone && (
            <div style={detailItem}>
              <Text style={detailLabel}>PHONE</Text>
              <Text style={detailValue}>{event.customer_phone}</Text>
            </div>
          )}

          {(event.location || event.service_address) && (
            <div style={detailItem}>
              <Text style={detailLabel}>LOCATION</Text>
              <Text style={detailValue}>
                {event.location || event.service_address}
              </Text>
            </div>
          )}
        </Column>

        <Column style={detailColumn}>
          {event.proposed_datetime && (
            <div style={detailItem}>
              <Text style={detailLabel}>PROPOSED TIME</Text>
              <Text style={detailValue}>
                {formatDateTime(event.proposed_datetime)}
              </Text>
            </div>
          )}

          {event.service_type && (
            <div style={detailItem}>
              <Text style={detailLabel}>SERVICE</Text>
              <Text style={detailValue}>{event.service_type}</Text>
            </div>
          )}

          {event.price_estimate && (
            <div style={detailItem}>
              <Text style={detailLabel}>EST. PRICE</Text>
              <Text style={detailValue}>{event.price_estimate}</Text>
            </div>
          )}
        </Column>
      </Row>

      {/* Event Description */}
      <Section style={eventDescription}>
        <Text style={descriptionText}>{event.description}</Text>
      </Section>

      {/* Confidence Bar */}
      <Section style={confidenceSection}>
        <div style={confidenceBar}>
          <div
            style={{
              ...confidenceFill,
              width: `${confidencePercent}%`,
              backgroundColor: confidenceColor,
            }}
          />
        </div>
        <Text style={confidenceText}>
          Confidence: {confidencePercent}% •{' '}
          {getConfidenceLabel(event.confidence_score)}
        </Text>
      </Section>

      {/* Quick Actions */}
      <Section style={actionsSection}>
        <Row>
          <Column>
            <Link
              href={`${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id || 'new'}?action=confirm&call=${callId}`}
              style={{ ...actionButton, ...confirmButton }}
            >
              ✓ Confirm Appointment
            </Link>
          </Column>
          <Column>
            <Link
              href={`${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id || 'new'}?action=edit&call=${callId}`}
              style={{ ...actionButton, ...editButton }}
            >
              ✏️ Edit Details
            </Link>
          </Column>
        </Row>
      </Section>
    </Section>
  );
}

// Utility Functions
function getUrgencyConfig(urgency: string) {
  const configs = {
    emergency: {
      label: '🚨 EMERGENCY',
      style: { backgroundColor: '#dc2626', color: '#ffffff' },
    },
    high: {
      label: '🔴 HIGH PRIORITY',
      style: { backgroundColor: '#f59e0b', color: '#ffffff' },
    },
    medium: {
      label: '🟡 MEDIUM',
      style: { backgroundColor: '#10b981', color: '#ffffff' },
    },
    low: {
      label: '🔵 LOW',
      style: { backgroundColor: '#6b7280', color: '#ffffff' },
    },
  };
  return (configs as any)[urgency] || configs.low;
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return '#10b981'; // green
  if (confidence >= 0.6) return '#f59e0b'; // yellow
  return '#ef4444'; // red
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return 'Very High';
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.6) return 'Medium';
  if (confidence >= 0.4) return 'Low';
  return 'Very Low';
}

function formatDateTime(datetime: string): string {
  return new Date(datetime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

// Styles
const eventCard = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '16px',
  position: 'relative' as const,
  backgroundColor: '#ffffff',
};

const urgentCard = {
  borderColor: '#dc2626',
  backgroundColor: '#fef2f2',
};

const urgencyBadge = {
  position: 'absolute' as const,
  top: '-1px',
  right: '-1px',
  padding: '4px 8px',
  borderRadius: '0 8px 0 8px',
  fontSize: '10px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const eventType = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 12px 0',
};

const eventTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 16px 0',
  lineHeight: '1.3',
};

const detailsGrid = {
  marginBottom: '16px',
};

const detailColumn = {
  verticalAlign: 'top' as const,
  paddingRight: '16px',
};

const detailItem = {
  marginBottom: '12px',
};

const detailLabel = {
  fontSize: '11px',
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px 0',
  fontWeight: '500',
};

const detailValue = {
  fontSize: '14px',
  color: '#111827',
  fontWeight: '500',
  margin: '0',
};

const eventDescription = {
  backgroundColor: '#f9fafb',
  padding: '12px',
  borderRadius: '6px',
  marginBottom: '16px',
  border: '1px solid #f3f4f6',
};

const descriptionText = {
  fontSize: '14px',
  color: '#374151',
  margin: '0',
  lineHeight: '1.4',
};

const confidenceSection = {
  marginBottom: '16px',
};

const confidenceBar = {
  height: '6px',
  backgroundColor: '#e5e7eb',
  borderRadius: '3px',
  overflow: 'hidden',
  marginBottom: '8px',
};

const confidenceFill = {
  height: '100%',
  borderRadius: '3px',
  transition: 'width 0.3s ease',
};

const confidenceText = {
  fontSize: '11px',
  color: '#6b7280',
  margin: '0',
};

const actionsSection = {
  borderTop: '1px solid #f3f4f6',
  paddingTop: '16px',
};

const actionButton = {
  display: 'inline-block',
  padding: '8px 16px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: '500',
  textAlign: 'center' as const,
  width: '100%',
  boxSizing: 'border-box' as const,
};

const confirmButton = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  marginRight: '8px',
};

const editButton = {
  backgroundColor: '#ffffff',
  color: '#374151',
  border: '1px solid #d1d5db',
};
