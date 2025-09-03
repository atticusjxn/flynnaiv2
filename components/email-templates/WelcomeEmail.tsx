import React from 'react';
import { Text, Section, Button, Hr } from '@react-email/components';
import BaseEmailLayout from './BaseEmailLayout';

interface WelcomeEmailProps {
  userName: string;
  companyName: string;
  industry: string;
  setupUrl: string;
  supportUrl?: string;
}

export default function WelcomeEmail({
  userName,
  companyName,
  industry,
  setupUrl,
  supportUrl = 'https://flynn.ai/support',
}: WelcomeEmailProps) {
  const industryConfig = getIndustryConfig(industry);

  return (
    <BaseEmailLayout
      preview={`Welcome to Flynn.ai, ${userName}! Let's get your ${industryConfig.label} business set up.`}
      companyName={companyName}
      industry={industry}
      primaryColor={industryConfig.primaryColor}
    >
      <Text style={greeting}>Welcome to Flynn.ai, {userName}!</Text>

      <Text style={bodyText}>
        Thank you for joining Flynn.ai. We're excited to help transform your
        business calls into organized calendar events automatically.
      </Text>

      <Section style={industrySection}>
        <Text style={sectionTitle}>Optimized for {industryConfig.label}</Text>
        <Text style={bodyText}>
          We've configured Flynn.ai specifically for your {industryConfig.label}{' '}
          business. Our AI understands your industry terminology and will
          extract {industryConfig.eventTypes.join(', ')} with precision.
        </Text>
      </Section>

      <Section style={benefitsSection}>
        <Text style={sectionTitle}>What happens next:</Text>
        <div style={benefitsList}>
          <div style={benefitItem}>
            <Text style={benefitNumber}>1</Text>
            <Text style={benefitText}>
              <strong>Get your Flynn.ai number</strong> - We'll provide you with
              a dedicated forwarding number
            </Text>
          </div>
          <div style={benefitItem}>
            <Text style={benefitNumber}>2</Text>
            <Text style={benefitText}>
              <strong>Setup call forwarding</strong> - Simple 10-second setup
              forwards all calls to your phone
            </Text>
          </div>
          <div style={benefitItem}>
            <Text style={benefitNumber}>3</Text>
            <Text style={benefitText}>
              <strong>AI processes automatically</strong> - Every business call
              gets organized and summarized within 2 minutes
            </Text>
          </div>
        </div>
      </Section>

      <Section style={ctaSection}>
        <Button href={setupUrl} style={setupButton}>
          Complete Setup (2 minutes)
        </Button>
      </Section>

      <Hr style={divider} />

      <Section style={helpSection}>
        <Text style={helpTitle}>Need help getting started?</Text>
        <Text style={helpText}>
          Our {industryConfig.label} setup guide covers everything you need to
          know, from setting up call forwarding to understanding your first
          AI-generated appointment summary.
        </Text>
        <Button href={supportUrl} style={helpButton}>
          View Setup Guide
        </Button>
      </Section>

      <Section style={trialSection}>
        <Text style={trialText}>
          Your free trial includes 50 call processings and all premium features.
          No credit card required.
        </Text>
      </Section>
    </BaseEmailLayout>
  );
}

function getIndustryConfig(industry: string) {
  const configs = {
    plumbing: {
      label: 'Plumbing & HVAC',
      primaryColor: '#1e40af',
      eventTypes: ['service calls', 'emergency repairs', 'quotes'],
    },
    real_estate: {
      label: 'Real Estate',
      primaryColor: '#059669',
      eventTypes: ['property showings', 'client meetings', 'inspections'],
    },
    legal: {
      label: 'Legal Services',
      primaryColor: '#7c3aed',
      eventTypes: ['consultations', 'client meetings', 'court dates'],
    },
    medical: {
      label: 'Medical Practice',
      primaryColor: '#dc2626',
      eventTypes: ['appointments', 'consultations', 'follow-ups'],
    },
    sales: {
      label: 'Sales',
      primaryColor: '#ea580c',
      eventTypes: ['demos', 'discovery calls', 'follow-ups'],
    },
    consulting: {
      label: 'Consulting',
      primaryColor: '#0891b2',
      eventTypes: ['consultations', 'strategy sessions', 'workshops'],
    },
    default: {
      label: 'Professional Services',
      primaryColor: '#4f46e5',
      eventTypes: ['appointments', 'meetings', 'consultations'],
    },
  };

  return configs[industry as keyof typeof configs] || configs.default;
}

// Styles
const greeting = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#111827',
  margin: '0 0 16px 0',
  lineHeight: '32px',
};

const bodyText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 16px 0',
};

const industrySection = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 12px 0',
};

const benefitsSection = {
  margin: '32px 0',
};

const benefitsList = {
  margin: '16px 0',
};

const benefitItem = {
  display: 'flex',
  alignItems: 'flex-start',
  margin: '16px 0',
};

const benefitNumber = {
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  borderRadius: '50%',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: '600',
  marginRight: '12px',
  flexShrink: 0,
};

const benefitText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#374151',
  margin: '0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const setupButton = {
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  padding: '12px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: '600',
  display: 'inline-block',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const helpSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const helpTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 8px 0',
};

const helpText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6b7280',
  margin: '0 0 16px 0',
};

const helpButton = {
  backgroundColor: 'transparent',
  color: '#4f46e5',
  border: '1px solid #4f46e5',
  padding: '8px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
  display: 'inline-block',
};

const trialSection = {
  backgroundColor: '#ecfdf5',
  border: '1px solid #d1fae5',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0 0 0',
  textAlign: 'center' as const,
};

const trialText = {
  fontSize: '14px',
  color: '#047857',
  margin: '0',
  fontWeight: '500',
};
