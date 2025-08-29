import React from 'react';
import CallOverviewEmail, { CallOverviewEmailProps } from '../CallOverviewEmail';
import { Section, Text, Link, Row, Column } from '@react-email/components';

interface RealEstateEmailProps extends CallOverviewEmailProps {
  // Real estate-specific props
  agentLicense?: string;
  brokerageInfo?: string;
  mlsNumber?: string;
  marketInsights?: boolean;
}

export default function RealEstateEmail(props: RealEstateEmailProps) {
  const hasHighPriorityEvents = props.extractedEvents.some(e => e.urgency === 'high');
  const hasPropertyMentions = props.extractedEvents.some(e => 
    e.location || e.description?.toLowerCase().includes('property') || 
    e.description?.toLowerCase().includes('house') || 
    e.description?.toLowerCase().includes('home')
  );

  return (
    <CallOverviewEmail {...props}>
      {/* High-priority client alert */}
      {hasHighPriorityEvents && (
        <Section style={priorityClientSection}>
          <Text style={priorityTitle}>
            🏆 HIGH-PRIORITY CLIENT ACTIVITY
          </Text>
          <Text style={priorityText}>
            This call contains high-priority property inquiries. Quick response times are crucial 
            in today's competitive market to secure qualified buyers and maintain momentum.
          </Text>
          
          <Row style={priorityActions}>
            <Column>
              <Link
                href={`${props.dashboardUrl}/client-follow-up?call=${props.callId}&priority=high`}
                style={priorityFollowUpButton}
              >
                🚀 Priority Follow-up
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

      {/* Property Information Section */}
      {hasPropertyMentions && (
        <Section style={propertySection}>
          <Text style={propertyTitle}>🏠 Property Intelligence</Text>
          <Row>
            <Column>
              <Text style={propertyLabel}>Client Type:</Text>
              <Text style={propertyText}>
                {determineClientType(props.extractedEvents, props.transcriptionSnippet)}
              </Text>
            </Column>
            <Column>
              <Text style={propertyLabel}>Price Range Mentioned:</Text>
              <Text style={propertyText}>
                {extractPriceRange(props.transcriptionSnippet) || 'Not specified'}
              </Text>
            </Column>
          </Row>
          
          <Text style={propertyLabel}>Property Preferences:</Text>
          <Text style={propertyText}>
            {extractPropertyPreferences(props.extractedEvents, props.transcriptionSnippet)}
          </Text>
        </Section>
      )}

      {/* Market Timing Section */}
      <Section style={marketTimingSection}>
        <Text style={marketTimingTitle}>⏰ Market Timing Insights</Text>
        <Row>
          <Column>
            <Text style={timingLabel}>Response Priority:</Text>
            <Text style={timingText}>
              {hasHighPriorityEvents ? 'IMMEDIATE (< 1 hour)' : 'Same day preferred'}
            </Text>
          </Column>
          <Column>
            <Text style={timingLabel}>Best Follow-up Time:</Text>
            <Text style={timingText}>
              Business hours: 9 AM - 6 PM<br />
              Weekends available for showings
            </Text>
          </Column>
        </Row>
        
        <Text style={marketTip}>
          💡 Market Tip: {getMarketTip(props.extractedEvents)}
        </Text>
      </Section>

      {/* Client Engagement Tools */}
      <Section style={engagementSection}>
        <Text style={engagementTitle}>🎯 Client Engagement Tools</Text>
        <Row>
          <Column>
            <Link
              href={`${props.dashboardUrl}/property-matcher?call=${props.callId}`}
              style={{...engagementButton, ...propertyMatchButton}}
            >
              🔍 Property Matcher
            </Link>
          </Column>
          <Column>
            <Link
              href={`${props.dashboardUrl}/market-report?call=${props.callId}`}
              style={{...engagementButton, ...marketReportButton}}
            >
              📊 Market Report
            </Link>
          </Column>
        </Row>
        <Row style={{marginTop: '8px'}}>
          <Column>
            <Link
              href={`${props.dashboardUrl}/showing-scheduler?call=${props.callId}`}
              style={{...engagementButton, ...schedulerButton}}
            >
              📅 Showing Scheduler
            </Link>
          </Column>
          <Column>
            <Link
              href={`${props.dashboardUrl}/comps?call=${props.callId}`}
              style={{...engagementButton, ...compsButton}}
            >
              🏘️ Comparable Sales
            </Link>
          </Column>
        </Row>
      </Section>

      {/* Professional Compliance Section */}
      <Section style={complianceSection}>
        <Text style={complianceTitle}>⚖️ Professional Standards</Text>
        <Text style={complianceText}>
          • All communications logged for compliance<br />
          • Fair housing laws strictly observed<br />
          • MLS data handled per broker guidelines<br />
          • Client information kept confidential<br />
          {props.agentLicense && `• Agent License: ${props.agentLicense}`}
          {props.brokerageInfo && `<br />• Brokerage: ${props.brokerageInfo}`}
        </Text>
      </Section>

      {/* Real Estate Pro Tips */}
      <Section style={proTipsSection}>
        <Text style={proTipsTitle}>🎓 Real Estate Pro Tips:</Text>
        <Text style={proTipsList}>
          • <strong>Quick Response:</strong> Reply within 5-15 minutes for hot leads<br />
          • <strong>Property Photos:</strong> Have current listings ready to share<br />
          • <strong>Market Data:</strong> Prepare neighborhood statistics and comps<br />
          • <strong>Availability:</strong> Confirm your showing schedule flexibility<br />
          • <strong>Pre-approval:</strong> Ask about financing pre-qualification status
        </Text>
      </Section>
    </CallOverviewEmail>
  );
}

// Helper functions
function determineClientType(events: any[], transcription?: string): string {
  const content = transcription?.toLowerCase() || '';
  
  if (content.includes('first time') || content.includes('first home')) return 'First-time buyer';
  if (content.includes('selling') || content.includes('list my')) return 'Seller';
  if (content.includes('investment') || content.includes('rental')) return 'Investor';
  if (content.includes('relocat') || content.includes('moving')) return 'Relocating buyer';
  if (content.includes('cash') || content.includes('pre-approved')) return 'Qualified buyer';
  
  return 'Prospective buyer';
}

function extractPriceRange(transcription?: string): string | null {
  if (!transcription) return null;
  
  const pricePatterns = [
    /\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?[kK]?)/g,
    /(\d{1,3}(?:,\d{3})*)\s*(?:thousand|million|k|m)/gi,
    /budget.*?(\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?[kK]?)/gi,
  ];
  
  for (const pattern of pricePatterns) {
    const matches = transcription.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0];
    }
  }
  
  return null;
}

function extractPropertyPreferences(events: any[], transcription?: string): string {
  const content = transcription?.toLowerCase() || '';
  const preferences = [];
  
  // Property types
  if (content.includes('condo')) preferences.push('Condominium');
  if (content.includes('townhouse') || content.includes('townhome')) preferences.push('Townhouse');
  if (content.includes('single family') || content.includes('house')) preferences.push('Single-family home');
  if (content.includes('new construction')) preferences.push('New construction');
  
  // Features
  if (content.includes('bedroom')) {
    const bedroomMatch = content.match(/(\d+)\s*bedroom/);
    if (bedroomMatch) preferences.push(`${bedroomMatch[1]}+ bedrooms`);
  }
  if (content.includes('bathroom')) {
    const bathroomMatch = content.match(/(\d+)\s*bathroom/);
    if (bathroomMatch) preferences.push(`${bathroomMatch[1]}+ bathrooms`);
  }
  if (content.includes('garage')) preferences.push('Garage required');
  if (content.includes('yard') || content.includes('garden')) preferences.push('Outdoor space');
  
  // Location preferences
  if (content.includes('school')) preferences.push('Good school district');
  if (content.includes('downtown') || content.includes('city')) preferences.push('Urban location');
  if (content.includes('quiet') || content.includes('suburban')) preferences.push('Quiet neighborhood');
  
  return preferences.length > 0 ? preferences.join(', ') : 'General property inquiry';
}

function getMarketTip(events: any[]): string {
  const tips = [
    'Pre-qualified buyers move faster - ask about financing status',
    'Multiple showings often indicate serious interest',
    'Weekend availability increases showing success rates',
    'Market comparables help justify pricing discussions',
    'Quick follow-up is critical in competitive markets',
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
}

// Real Estate-specific styles
const priorityClientSection = {
  backgroundColor: '#fef3c7',
  border: '2px solid #f59e0b',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const priorityTitle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#92400e',
  margin: '0 0 12px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const priorityText = {
  fontSize: '14px',
  color: '#78350f',
  margin: '0 0 16px 0',
  lineHeight: '1.5',
};

const priorityActions = {
  marginTop: '16px',
};

const priorityFollowUpButton = {
  display: 'inline-block',
  padding: '12px 20px',
  backgroundColor: '#f59e0b',
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

const propertySection = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const propertyTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#166534',
  margin: '0 0 16px 0',
};

const propertyLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#1f2937',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 6px 0',
};

const propertyText = {
  fontSize: '13px',
  color: '#374151',
  margin: '0 0 12px 0',
  lineHeight: '1.4',
};

const marketTimingSection = {
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const marketTimingTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1e40af',
  margin: '0 0 16px 0',
};

const timingLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#1f2937',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 6px 0',
};

const timingText = {
  fontSize: '13px',
  color: '#374151',
  margin: '0 0 12px 0',
  lineHeight: '1.4',
};

const marketTip = {
  fontSize: '13px',
  color: '#1e40af',
  fontWeight: '500',
  fontStyle: 'italic',
  textAlign: 'center' as const,
  margin: '16px 0 0 0',
  padding: '12px',
  backgroundColor: '#dbeafe',
  borderRadius: '4px',
};

const engagementSection = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const engagementTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#374151',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const engagementButton = {
  display: 'inline-block',
  padding: '10px 16px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: '500',
  textAlign: 'center' as const,
  width: '100%',
  boxSizing: 'border-box' as const,
  marginBottom: '8px',
};

const propertyMatchButton = {
  backgroundColor: '#059669',
  color: '#ffffff',
};

const marketReportButton = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
};

const schedulerButton = {
  backgroundColor: '#7c3aed',
  color: '#ffffff',
};

const compsButton = {
  backgroundColor: '#dc2626',
  color: '#ffffff',
};

const complianceSection = {
  backgroundColor: '#fafafa',
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px',
};

const complianceTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#525252',
  margin: '0 0 10px 0',
};

const complianceText = {
  fontSize: '12px',
  color: '#737373',
  margin: '0',
  lineHeight: '1.5',
};

const proTipsSection = {
  backgroundColor: '#fefbf2',
  border: '1px solid #fed7aa',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px',
};

const proTipsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#9a3412',
  margin: '0 0 10px 0',
};

const proTipsList = {
  fontSize: '13px',
  color: '#9a3412',
  margin: '0',
  lineHeight: '1.6',
};