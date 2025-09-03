// Flynn.ai v2 - Customer Reminder Email Template
// Automated appointment reminder email for customers

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Button,
  Link,
  Hr,
} from '@react-email/components';

export interface CustomerReminderEmailProps {
  customerName: string;
  companyName: string;
  eventType: string;
  eventTitle: string;
  confirmedDateTime: string;
  location?: string;
  duration?: number;
  businessPhone?: string;
  businessEmail?: string;
  confirmationUrl?: string;
  rescheduleUrl?: string;
  hoursUntilEvent: number;
  specialInstructions?: string;
}

export default function CustomerReminderEmail({
  customerName = 'Valued Customer',
  companyName = 'Your Service Provider',
  eventType = 'appointment',
  eventTitle = 'Service Appointment',
  confirmedDateTime = 'Date and time to be confirmed',
  location = 'Location to be determined',
  duration,
  businessPhone,
  businessEmail,
  confirmationUrl,
  rescheduleUrl,
  hoursUntilEvent = 24,
  specialInstructions,
}: CustomerReminderEmailProps) {
  const formattedDateTime = new Date(confirmedDateTime).toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }
  );

  const timeUntilText =
    hoursUntilEvent < 24
      ? `in ${hoursUntilEvent} ${hoursUntilEvent === 1 ? 'hour' : 'hours'}`
      : `in ${Math.round(hoursUntilEvent / 24)} ${Math.round(hoursUntilEvent / 24) === 1 ? 'day' : 'days'}`;

  const urgencyLevel =
    hoursUntilEvent <= 2
      ? 'urgent'
      : hoursUntilEvent <= 24
        ? 'soon'
        : 'upcoming';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Heading style={h1}>
                  {urgencyLevel === 'urgent'
                    ? '🚨 Reminder: '
                    : '📅 Reminder: '}
                  {eventType.charAt(0).toUpperCase() + eventType.slice(1)}{' '}
                  {timeUntilText}
                </Heading>
                <Text style={subtitle}>
                  Don't forget your upcoming {eventType} with {companyName}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Event Details Card */}
            <div style={eventCard}>
              <Heading style={eventTitle}>{eventTitle}</Heading>

              <div style={eventDetails}>
                <div style={detailRow}>
                  <div style={detailIcon}>📅</div>
                  <div style={detailContent}>
                    <Text style={detailLabel}>Date & Time</Text>
                    <Text style={detailValue}>{formattedDateTime}</Text>
                    <Text style={timeUntil}>({timeUntilText})</Text>
                  </div>
                </div>

                <div style={detailRow}>
                  <div style={detailIcon}>📍</div>
                  <div style={detailContent}>
                    <Text style={detailLabel}>Location</Text>
                    <Text style={detailValue}>{location}</Text>
                  </div>
                </div>

                {duration && (
                  <div style={detailRow}>
                    <div style={detailIcon}>⏱️</div>
                    <div style={detailContent}>
                      <Text style={detailLabel}>Expected Duration</Text>
                      <Text style={detailValue}>
                        {duration} {duration === 1 ? 'minute' : 'minutes'}
                      </Text>
                    </div>
                  </div>
                )}
              </div>

              {specialInstructions && (
                <div style={instructionsSection}>
                  <Text style={instructionsLabel}>Special Instructions</Text>
                  <Text style={instructionsText}>{specialInstructions}</Text>
                </div>
              )}
            </div>

            {/* Preparation Tips */}
            {urgencyLevel === 'upcoming' && (
              <div style={tipsCard}>
                <Heading style={tipsTitle}>💡 Preparation Tips</Heading>
                <ul style={tipsList}>
                  <li style={tipItem}>
                    <Text style={tipText}>
                      Please ensure someone is available at the scheduled time
                    </Text>
                  </li>
                  <li style={tipItem}>
                    <Text style={tipText}>
                      Have any relevant information or questions ready
                    </Text>
                  </li>
                  <li style={tipItem}>
                    <Text style={tipText}>
                      Contact us if you need to reschedule at least 24 hours in
                      advance
                    </Text>
                  </li>
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <Section style={buttonSection}>
              <Row>
                {confirmationUrl && (
                  <Column style={buttonColumn}>
                    <Button href={confirmationUrl} style={primaryButton}>
                      ✓ Confirm I'll Be There
                    </Button>
                  </Column>
                )}

                {rescheduleUrl && (
                  <Column style={buttonColumn}>
                    <Button href={rescheduleUrl} style={secondaryButton}>
                      📅 Reschedule
                    </Button>
                  </Column>
                )}
              </Row>
            </Section>

            {/* Contact Information */}
            <Section style={contactSection}>
              <Heading style={contactTitle}>Need to Make Changes?</Heading>

              <Text style={contactDescription}>
                If you need to reschedule or have any questions, please contact
                us as soon as possible:
              </Text>

              <div style={contactInfo}>
                {businessPhone && (
                  <div style={contactRow}>
                    <Text style={contactLabel}>📞 Call:</Text>
                    <Link href={`tel:${businessPhone}`} style={contactLink}>
                      {businessPhone}
                    </Link>
                  </div>
                )}

                {businessEmail && (
                  <div style={contactRow}>
                    <Text style={contactLabel}>✉️ Email:</Text>
                    <Link href={`mailto:${businessEmail}`} style={contactLink}>
                      {businessEmail}
                    </Link>
                  </div>
                )}
              </div>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated reminder from {companyName}.
            </Text>
            <Text style={footerText}>
              Powered by{' '}
              <Link href="https://flynn.ai" style={linkStyle}>
                Flynn.ai
              </Link>{' '}
              - Never miss an appointment again
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: '0',
  padding: '0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginBottom: '32px',
  marginTop: '32px',
  maxWidth: '600px',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
};

const header = {
  backgroundColor: '#059669', // Green for reminder
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '32px',
  margin: '0 0 8px 0',
};

const subtitle = {
  color: '#d1fae5',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const content = {
  padding: '32px 24px',
};

const eventCard = {
  backgroundColor: '#f0fdf4',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  border: '2px solid #bbf7d0',
};

const eventTitle = {
  color: '#1e293b',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px 0',
};

const eventDetails = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '16px',
};

const detailRow = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
};

const detailIcon = {
  fontSize: '18px',
  minWidth: '24px',
};

const detailContent = {
  flex: '1',
};

const detailLabel = {
  color: '#64748b',
  fontSize: '14px',
  fontWeight: '500',
  lineHeight: '20px',
  margin: '0 0 4px 0',
};

const detailValue = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0',
};

const timeUntil = {
  color: '#059669',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '20px',
  margin: '4px 0 0 0',
};

const instructionsSection = {
  marginTop: '20px',
  paddingTop: '20px',
  borderTop: '1px solid #d1fae5',
};

const instructionsLabel = {
  color: '#064e3b',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '20px',
  margin: '0 0 8px 0',
};

const instructionsText = {
  color: '#1e293b',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  fontStyle: 'italic',
};

const tipsCard = {
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #fbbf24',
};

const tipsTitle = {
  color: '#92400e',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const tipsList = {
  margin: '0',
  paddingLeft: '0',
  listStyle: 'none',
};

const tipItem = {
  marginBottom: '12px',
  paddingLeft: '20px',
  position: 'relative' as const,
};

const tipText = {
  color: '#1e293b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const buttonSection = {
  marginBottom: '32px',
};

const buttonColumn = {
  textAlign: 'center' as const,
  paddingBottom: '12px',
};

const primaryButton = {
  backgroundColor: '#059669',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  minWidth: '180px',
};

const secondaryButton = {
  backgroundColor: '#f1f5f9',
  borderRadius: '8px',
  color: '#475569',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  minWidth: '140px',
  border: '1px solid #cbd5e1',
};

const contactSection = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
};

const contactTitle = {
  color: '#1e293b',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 12px 0',
};

const contactDescription = {
  color: '#64748b',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const contactInfo = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
};

const contactRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const contactLabel = {
  color: '#64748b',
  fontSize: '14px',
  fontWeight: '500',
  lineHeight: '20px',
  margin: '0',
  minWidth: '65px',
};

const contactLink = {
  color: '#059669',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  textDecoration: 'none',
  margin: '0',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '0',
};

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px 0',
};

const linkStyle = {
  color: '#1e40af',
  textDecoration: 'none',
};
