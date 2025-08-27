import React from 'react';
import {
  Html,
  Head,
  Font,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
  Hr,
} from '@react-email/components';

interface BaseEmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  companyName?: string;
  industry?: string;
  primaryColor?: string;
}

export default function BaseEmailLayout({
  preview,
  children,
  companyName = 'Your Business',
  industry = 'general',
  primaryColor = '#4f46e5',
}: BaseEmailLayoutProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="system-ui"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={{...header, background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, 20)} 100%)`}}>
            <div style={logoContainer}>
              <Img
                src="https://flynn.ai/logo-white.png"
                alt="Flynn.ai"
                width="32"
                height="32"
                style={logoImage}
              />
              <Text style={headerTitle}>Flynn.ai</Text>
            </div>
            <Text style={headerSubtitle}>
              {companyName} • AI-Powered Call Processing
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Powered by{' '}
              <Link href="https://flynn.ai" style={footerLink}>
                Flynn.ai
              </Link>
              {' • '}
              <Link href="mailto:support@flynn.ai" style={footerLink}>
                Support
              </Link>
              {' • '}
              <Link href="https://flynn.ai/privacy" style={footerLink}>
                Privacy Policy
              </Link>
            </Text>
            <Text style={footerDisclaimer}>
              This email contains AI-generated content based on your phone call.
              Please review all appointments and contact details for accuracy.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Utility function to adjust color brightness
function adjustColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
};

const header = {
  padding: '24px',
  textAlign: 'center' as const,
  color: '#ffffff',
};

const logoContainer = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '8px',
};

const logoImage = {
  marginRight: '8px',
};

const headerTitle = {
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
  color: '#ffffff',
};

const headerSubtitle = {
  fontSize: '14px',
  margin: '0',
  opacity: 0.9,
  color: '#ffffff',
};

const content = {
  padding: '24px',
};

const footer = {
  backgroundColor: '#374151',
  padding: '20px 24px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#d1d5db',
  margin: '0 0 8px 0',
};

const footerLink = {
  color: '#9ca3af',
  textDecoration: 'none',
};

const footerDisclaimer = {
  fontSize: '11px',
  lineHeight: '14px',
  color: '#9ca3af',
  margin: '0',
  fontStyle: 'italic',
};