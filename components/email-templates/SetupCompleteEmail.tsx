import React from 'react';
import { Text, Section, Button, Hr } from '@react-email/components';
import BaseEmailLayout from './BaseEmailLayout';

interface SetupCompleteEmailProps {
  userName: string;
  companyName: string;
  industry: string;
  phoneNumber: string;
  dashboardUrl: string;
  supportUrl?: string;
}

export default function SetupCompleteEmail({
  userName,
  companyName,
  industry,
  phoneNumber,
  dashboardUrl,
  supportUrl = 'https://flynn.ai/support',
}: SetupCompleteEmailProps) {
  const industryConfig = getIndustryConfig(industry);

  return (
    <BaseEmailLayout
      preview={`${companyName} is now ready! Start using Flynn.ai today.`}
      companyName={companyName}
      industry={industry}
      primaryColor={industryConfig.primaryColor}
    >
      <Text style={greeting}>🎉 You're all set, {userName}!</Text>

      <Text style={bodyText}>
        Congratulations! Flynn.ai is now fully configured for {companyName} and
        ready to transform your business calls into organized calendar events.
      </Text>

      <Section style={setupSummary}>
        <Text style={sectionTitle}>Setup Complete</Text>
        <div style={summaryItem}>
          <Text style={summaryLabel}>Business:</Text>
          <Text style={summaryValue}>
            {companyName} ({industryConfig.label})
          </Text>
        </div>
        <div style={summaryItem}>
          <Text style={summaryLabel}>Phone Number:</Text>
          <Text style={summaryValue}>{phoneNumber}</Text>
        </div>
        <div style={summaryItem}>
          <Text style={summaryLabel}>AI Processing:</Text>
          <Text style={summaryValue}>
            Active - Automatically processes all business calls
          </Text>
        </div>
      </Section>

      <Section style={instructionsSection}>
        <Text style={sectionTitle}>How Flynn.ai Works</Text>

        <div style={instructionStep}>
          <div style={stepHeader}>
            <Text style={stepNumber}>1</Text>
            <Text style={stepTitle}>All Calls Forwarded</Text>
          </div>
          <Text style={stepDescription}>
            All calls to your Flynn.ai number are automatically forwarded to
            your phone. You answer normally and have your conversation.
          </Text>
        </div>

        <div style={instructionStep}>
          <div style={stepHeader}>
            <Text style={stepNumber}>2</Text>
            <Text style={stepTitle}>AI Processes Business Calls</Text>
          </div>
          <Text style={stepDescription}>
            Flynn.ai automatically detects and processes business calls,
            listening for {industryConfig.eventTypes.join(', ')} while filtering
            out personal conversations.
          </Text>
        </div>

        <div style={instructionStep}>
          <div style={stepHeader}>
            <Text style={stepNumber}>3</Text>
            <Text style={stepTitle}>Receive Professional Summary</Text>
          </div>
          <Text style={stepDescription}>
            Within 2 minutes of ending a business call, you'll receive a
            professional email with extracted appointments and calendar files
            ready to import.
          </Text>
        </div>
      </Section>

      <Section style={ctaSection}>
        <Button href={dashboardUrl} style={dashboardButton}>
          Open Your Dashboard
        </Button>
      </Section>

      <Hr style={divider} />

      <Section style={tipsSection}>
        <Text style={tipsTitle}>Pro Tips for Best Results</Text>
        <div style={tipsList}>
          <Text style={tipItem}>
            • Speak clearly when discussing dates, times, and addresses
          </Text>
          <Text style={tipItem}>
            • Confirm appointment details at the end of calls
          </Text>
          <Text style={tipItem}>
            • Review and edit AI-generated appointments in your dashboard
          </Text>
          <Text style={tipItem}>
            • Use the dashboard toggle to pause AI processing if needed
          </Text>
        </div>
      </Section>

      <Section style={supportSection}>
        <Text style={supportTitle}>Questions or Need Help?</Text>
        <Text style={supportText}>
          Our team is here to help you get the most out of Flynn.ai. We've
          processed millions of calls across all industries.
        </Text>
        <Button href={supportUrl} style={supportButton}>
          Contact Support
        </Button>
      </Section>

      <Section style={trialSection}>
        <Text style={trialText}>
          Your free trial includes 50 call processings. Upgrade anytime for
          unlimited processing and advanced features.
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
  fontSize: '28px',
  fontWeight: '700',
  color: '#111827',
  margin: '0 0 20px 0',
  lineHeight: '36px',
  textAlign: 'center' as const,
};

const bodyText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const setupSummary = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 16px 0',
};

const summaryItem = {
  display: 'flex',
  justifyContent: 'space-between',
  margin: '8px 0',
  paddingBottom: '8px',
  borderBottom: '1px solid #e0f2fe',
};

const summaryLabel = {
  fontSize: '14px',
  color: '#6b7280',
  fontWeight: '500',
  margin: '0',
};

const summaryValue = {
  fontSize: '14px',
  color: '#111827',
  fontWeight: '600',
  margin: '0',
};

const instructionsSection = {
  margin: '32px 0',
};

const instructionStep = {
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  borderLeft: '4px solid #4f46e5',
};

const stepHeader = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '8px',
};

const stepNumber = {
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  borderRadius: '50%',
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: '700',
  marginRight: '12px',
  flexShrink: 0,
};

const stepTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '0',
};

const stepDescription = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#4b5563',
  margin: '0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const dashboardButton = {
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  padding: '16px 40px',
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

const tipsSection = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fed7aa',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const tipsTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#92400e',
  margin: '0 0 12px 0',
};

const tipsList = {
  margin: '0',
};

const tipItem = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#78350f',
  margin: '4px 0',
};

const supportSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const supportTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 8px 0',
};

const supportText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6b7280',
  margin: '0 0 16px 0',
};

const supportButton = {
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
