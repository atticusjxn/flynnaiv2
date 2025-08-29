// Flynn.ai v2 - Customer Confirmation Email Template
// Professional appointment confirmation email for customers

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
  Img,
  Preview
} from '@react-email/components';

export interface CustomerConfirmationEmailProps {
  customerName: string;
  companyName: string;
  eventType: string;
  eventTitle: string;
  eventDescription?: string;
  confirmedDateTime: string;
  location?: string;
  duration?: number;
  priceEstimate?: number;
  currency?: string;
  businessPhone?: string;
  businessEmail?: string;
  confirmationUrl?: string;
  rescheduleUrl?: string;
  cancelUrl?: string;
  notes?: string;
}

export default function CustomerConfirmationEmail({
  customerName = "Valued Customer",
  companyName = "Your Service Provider",
  eventType = "appointment",
  eventTitle = "Service Appointment",
  eventDescription,
  confirmedDateTime = "Date and time to be confirmed",
  location = "Location to be determined",
  duration,
  priceEstimate,
  currency = "USD",
  businessPhone,
  businessEmail,
  confirmationUrl,
  rescheduleUrl,
  cancelUrl,
  notes
}: CustomerConfirmationEmailProps) {
  const formattedDateTime = new Date(confirmedDateTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const formattedPrice = priceEstimate 
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(priceEstimate)
    : null;

  return (
    <Html>
      <Head />
      <Preview>
        Your {eventType} with {companyName} is confirmed for {formattedDateTime}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Heading style={h1}>Appointment Confirmed ✓</Heading>
                <Text style={subtitle}>
                  Your {eventType} has been scheduled with {companyName}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Event Details Card */}
            <div style={eventCard}>
              <Heading style={eventTitle}>{eventTitle}</Heading>
              
              {eventDescription && (
                <Text style={eventDescription}>{eventDescription}</Text>
              )}

              <div style={eventDetails}>
                <div style={detailRow}>
                  <div style={detailIcon}>📅</div>
                  <div style={detailContent}>
                    <Text style={detailLabel}>Date & Time</Text>
                    <Text style={detailValue}>{formattedDateTime}</Text>
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
                      <Text style={detailLabel}>Duration</Text>
                      <Text style={detailValue}>
                        {duration} {duration === 1 ? 'minute' : 'minutes'}
                      </Text>
                    </div>
                  </div>
                )}

                {formattedPrice && (
                  <div style={detailRow}>
                    <div style={detailIcon}>💰</div>
                    <div style={detailContent}>
                      <Text style={detailLabel}>Estimated Cost</Text>
                      <Text style={detailValue}>{formattedPrice}</Text>
                    </div>
                  </div>
                )}
              </div>

              {notes && (
                <div style={notesSection}>
                  <Text style={detailLabel}>Additional Notes</Text>
                  <Text style={noteText}>{notes}</Text>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <Section style={buttonSection}>
              <Row>
                {confirmationUrl && (
                  <Column style={buttonColumn}>
                    <Button href={confirmationUrl} style={primaryButton}>
                      Confirm Appointment
                    </Button>
                  </Column>
                )}
                
                {rescheduleUrl && (
                  <Column style={buttonColumn}>
                    <Button href={rescheduleUrl} style={secondaryButton}>
                      Reschedule
                    </Button>
                  </Column>
                )}
                
                {cancelUrl && (
                  <Column style={buttonColumn}>
                    <Button href={cancelUrl} style={cancelButton}>
                      Cancel
                    </Button>
                  </Column>
                )}
              </Row>
            </Section>

            {/* Contact Information */}
            <Section style={contactSection}>
              <Heading style={contactTitle}>Questions? Contact Us</Heading>
              
              <div style={contactInfo}>
                {businessPhone && (
                  <div style={contactRow}>
                    <Text style={contactLabel}>Phone:</Text>
                    <Link href={`tel:${businessPhone}`} style={contactLink}>
                      {businessPhone}
                    </Link>
                  </div>
                )}
                
                {businessEmail && (
                  <div style={contactRow}>
                    <Text style={contactLabel}>Email:</Text>
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
              This appointment was automatically scheduled based on your phone call with {companyName}.
            </Text>
            <Text style={footerText}>
              Powered by <Link href="https://flynn.ai" style={linkStyle}>Flynn.ai</Link> - 
              Smart call-to-calendar automation
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
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
  backgroundColor: '#1e40af',
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
  color: '#e2e8f0',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const content = {
  padding: '32px 24px',
};

const eventCard = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #e2e8f0',
};

const eventTitle = {
  color: '#1e293b',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 12px 0',
};

const eventDescription = {
  color: '#64748b',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px 0',
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
  fontWeight: '500',
  lineHeight: '24px',
  margin: '0',
};

const notesSection = {
  marginTop: '20px',
  paddingTop: '20px',
  borderTop: '1px solid #e2e8f0',
};

const noteText = {
  color: '#1e293b',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0 0 0',
  fontStyle: 'italic',
};

const buttonSection = {
  marginBottom: '32px',
};

const buttonColumn = {
  textAlign: 'center' as const,
  paddingBottom: '12px',
};

const primaryButton = {
  backgroundColor: '#1e40af',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  minWidth: '160px',
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
  minWidth: '160px',
  border: '1px solid #cbd5e1',
};

const cancelButton = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  color: '#dc2626',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  minWidth: '160px',
  border: '1px solid #fecaca',
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
  margin: '0 0 16px 0',
};

const contactInfo = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px',
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
  minWidth: '50px',
};

const contactLink = {
  color: '#1e40af',
  fontSize: '16px',
  fontWeight: '500',
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