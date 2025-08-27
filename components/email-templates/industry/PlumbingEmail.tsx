import React from 'react';
import CallOverviewEmail, { CallOverviewEmailProps } from '../CallOverviewEmail';
import { Section, Text, Link, Row, Column } from '@react-email/components';

interface PlumbingEmailProps extends CallOverviewEmailProps {
  // Additional plumbing-specific props
  emergencyContact?: string;
  afterHoursAvailable?: boolean;
}

export default function PlumbingEmail(props: PlumbingEmailProps) {
  const hasEmergencyEvents = props.extractedEvents.some(e => e.urgency === 'emergency');

  return (
    <CallOverviewEmail {...props}>
      {/* Plumbing-specific emergency section */}
      {hasEmergencyEvents && (
        <Section style={emergencySection}>
          <Text style={emergencyTitle}>
            🚨 EMERGENCY SERVICE ALERT
          </Text>
          <Text style={emergencyText}>
            This call contains emergency plumbing requests that require immediate attention.
            Water damage and pipe bursts can cause significant property damage if not addressed quickly.
          </Text>
          
          {props.emergencyContact && (
            <Text style={emergencyContact}>
              Emergency Contact: <Link href={`tel:${props.emergencyContact}`} style={emergencyContactLink}>
                {props.emergencyContact}
              </Link>
            </Text>
          )}
          
          <Row style={emergencyActions}>
            <Column>
              <Link
                href={`${props.dashboardUrl}/dispatch/emergency?call=${props.callId}`}
                style={emergencyDispatchButton}
              >
                🚨 Emergency Dispatch
              </Link>
            </Column>
            <Column>
              <Link
                href={`tel:${props.callSummary.callerPhone}`}
                style={callBackButton}
              >
                📞 Call Back Now
              </Link>
            </Column>
          </Row>
        </Section>
      )}

      {/* Service Area & Availability Notice */}
      <Section style={serviceInfoSection}>
        <Text style={serviceInfoTitle}>🔧 Service Information</Text>
        <Row>
          <Column>
            <Text style={serviceInfoLabel}>Service Areas:</Text>
            <Text style={serviceInfoText}>
              All service calls will be scheduled based on location and technician availability.
            </Text>
          </Column>
          <Column>
            <Text style={serviceInfoLabel}>Response Time:</Text>
            <Text style={serviceInfoText}>
              Emergency: &lt; 2 hours<br />
              Urgent: Same day<br />
              Standard: 24-48 hours
            </Text>
          </Column>
        </Row>
        
        {props.afterHoursAvailable && (
          <Text style={afterHoursNotice}>
            💡 After-hours emergency service available 24/7 with premium rates
          </Text>
        )}
      </Section>

      {/* Plumbing-specific tips */}
      <Section style={tipsSection}>
        <Text style={tipsTitle}>🛠️ Before Your Service Appointment:</Text>
        <Text style={tipsList}>
          • Clear access to the problem area<br />
          • Locate your main water shut-off valve<br />
          • Document any recent changes to plumbing<br />
          • Prepare list of all affected fixtures<br />
          • Have payment method ready (cash, card, check)
        </Text>
      </Section>
    </CallOverviewEmail>
  );
}

// Plumbing-specific styles
const emergencySection = {
  backgroundColor: '#fef2f2',
  border: '2px solid #dc2626',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const emergencyTitle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#dc2626',
  margin: '0 0 12px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const emergencyText = {
  fontSize: '14px',
  color: '#7f1d1d',
  margin: '0 0 16px 0',
  lineHeight: '1.5',
};

const emergencyContact = {
  fontSize: '14px',
  color: '#7f1d1d',
  margin: '0 0 16px 0',
  fontWeight: '500',
};

const emergencyContactLink = {
  color: '#dc2626',
  textDecoration: 'none',
  fontWeight: '600',
};

const emergencyActions = {
  marginTop: '16px',
};

const emergencyDispatchButton = {
  display: 'inline-block',
  padding: '12px 20px',
  backgroundColor: '#dc2626',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '14px',
  textAlign: 'center' as const,
  width: '100%',
  boxSizing: 'border-box' as const,
  marginRight: '8px',
};

const callBackButton = {
  display: 'inline-block',
  padding: '12px 20px',
  backgroundColor: '#1f2937',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '14px',
  textAlign: 'center' as const,
  width: '100%',
  boxSizing: 'border-box' as const,
};

const serviceInfoSection = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const serviceInfoTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1e40af',
  margin: '0 0 16px 0',
};

const serviceInfoLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#1f2937',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 6px 0',
};

const serviceInfoText = {
  fontSize: '13px',
  color: '#374151',
  margin: '0 0 12px 0',
  lineHeight: '1.4',
};

const afterHoursNotice = {
  fontSize: '12px',
  color: '#059669',
  fontWeight: '500',
  textAlign: 'center' as const,
  margin: '16px 0 0 0',
  padding: '8px',
  backgroundColor: '#ecfdf5',
  borderRadius: '4px',
};

const tipsSection = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px',
};

const tipsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#92400e',
  margin: '0 0 10px 0',
};

const tipsList = {
  fontSize: '13px',
  color: '#78350f',
  margin: '0',
  lineHeight: '1.6',
};