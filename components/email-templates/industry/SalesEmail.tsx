import React from 'react';
import CallOverviewEmail, { CallOverviewEmailProps } from '../CallOverviewEmail';
import { Section, Text, Link, Row, Column } from '@react-email/components';

interface SalesEmailProps extends CallOverviewEmailProps {
  // Sales-specific props
  salesRepName?: string;
  salesTerritory?: string;
  crmIntegration?: boolean;
  pipelineStage?: string;
}

export default function SalesEmail(props: SalesEmailProps) {
  const hasHotLeads = props.extractedEvents.some(e => e.urgency === 'high');
  const hasMultipleMeetings = props.extractedEvents.length > 1;

  return (
    <CallOverviewEmail {...props}>
      {/* Hot Lead Alert */}
      {hasHotLeads && (
        <Section style={hotLeadSection}>
          <Text style={hotLeadTitle}>
            🔥 HOT LEAD ALERT
          </Text>
          <Text style={hotLeadText}>
            This prospect shows high buying intent and requires immediate follow-up. 
            Quick response time is critical to maintain momentum and secure the opportunity.
          </Text>
          
          <Row style={hotLeadActions}>
            <Column>
              <Link
                href={`${props.dashboardUrl}/hot-lead-response?call=${props.callId}`}
                style={hotLeadResponseButton}
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

      {/* Lead Qualification Matrix */}
      <Section style={qualificationSection}>
        <Text style={qualificationTitle}>🎯 Lead Qualification Assessment</Text>
        <Row>
          <Column>
            <Text style={qualificationLabel}>Lead Quality:</Text>
            <Text style={qualificationText}>
              {assessLeadQuality(props.extractedEvents, props.transcriptionSnippet)}
            </Text>
          </Column>
          <Column>
            <Text style={qualificationLabel}>Buying Stage:</Text>
            <Text style={qualificationText}>
              {determineBuyingStage(props.extractedEvents, props.transcriptionSnippet)}
            </Text>
          </Column>
        </Row>
        
        <Text style={qualificationLabel}>Budget Indicators:</Text>
        <Text style={qualificationText}>
          {extractBudgetIndicators(props.transcriptionSnippet)}
        </Text>
        
        <Text style={qualificationLabel}>Decision Authority:</Text>
        <Text style={qualificationText}>
          {assessDecisionAuthority(props.transcriptionSnippet)}
        </Text>
        
        <Text style={qualificationLabel}>Timeline:</Text>
        <Text style={qualificationText}>
          {extractTimeline(props.extractedEvents, props.transcriptionSnippet)}
        </Text>
      </Section>

      {/* Sales Opportunity Scoring */}
      <Section style={opportunitySection}>
        <Text style={opportunityTitle}>📊 Opportunity Scoring</Text>
        <Row>
          <Column>
            <Text style={scoreLabel}>Lead Score:</Text>
            <Text style={{...scoreText, ...getScoreStyle(calculateLeadScore(props.extractedEvents, props.transcriptionSnippet))}}>
              {calculateLeadScore(props.extractedEvents, props.transcriptionSnippet)}/100
            </Text>
          </Column>
          <Column>
            <Text style={scoreLabel}>Priority Level:</Text>
            <Text style={scoreText}>
              {hasHotLeads ? 'HIGH - Immediate Action' : 'MEDIUM - Standard Follow-up'}
            </Text>
          </Column>
        </Row>
        
        <Text style={opportunityTip}>
          💡 Sales Tip: {getSalesTip(props.extractedEvents)}
        </Text>
      </Section>

      {/* Sales Action Center */}
      <Section style={salesActionsSection}>
        <Text style={salesActionsTitle}>⚡ Sales Action Center</Text>
        <Row>
          <Column>
            <Link
              href={`${props.dashboardUrl}/crm-update?call=${props.callId}`}
              style={{...salesButton, ...crmButton}}
            >
              📊 Update CRM
            </Link>
          </Column>
          <Column>
            <Link
              href={`${props.dashboardUrl}/proposal-builder?call=${props.callId}`}
              style={{...salesButton, ...proposalButton}}
            >
              📋 Build Proposal
            </Link>
          </Column>
        </Row>
        <Row style={{marginTop: '8px'}}>
          <Column>
            <Link
              href={`${props.dashboardUrl}/demo-scheduler?call=${props.callId}`}
              style={{...salesButton, ...demoButton}}
            >
              🖥️ Schedule Demo
            </Link>
          </Column>
          <Column>
            <Link
              href={`${props.dashboardUrl}/follow-up-sequence?call=${props.callId}`}
              style={{...salesButton, ...sequenceButton}}
            >
              📧 Follow-up Sequence
            </Link>
          </Column>
        </Row>
      </Section>

      {/* Competitive Intelligence */}
      <Section style={competitiveSection}>
        <Text style={competitiveTitle}>🏆 Competitive Intelligence</Text>
        <Text style={competitiveText}>
          {extractCompetitiveInfo(props.transcriptionSnippet)}
        </Text>
        
        {extractCompetitors(props.transcriptionSnippet).length > 0 && (
          <>
            <Text style={competitiveLabel}>Competitors Mentioned:</Text>
            <Text style={competitiveList}>
              {extractCompetitors(props.transcriptionSnippet).join(', ')}
            </Text>
          </>
        )}
      </Section>

      {/* Pipeline Management */}
      <Section style={pipelineSection}>
        <Text style={pipelineTitle}>📈 Pipeline Management</Text>
        <Row>
          <Column>
            <Text style={pipelineLabel}>Suggested Next Stage:</Text>
            <Text style={pipelineText}>
              {suggestPipelineStage(props.extractedEvents, props.transcriptionSnippet)}
            </Text>
          </Column>
          <Column>
            <Text style={pipelineLabel}>Follow-up Timeline:</Text>
            <Text style={pipelineText}>
              {hasHotLeads ? 'Within 2 hours' : 'Within 24 hours'}
            </Text>
          </Column>
        </Row>
        
        <Text style={pipelineLabel}>Recommended Actions:</Text>
        <Text style={pipelineActions}>
          {getRecommendedActions(props.extractedEvents, props.transcriptionSnippet)}
        </Text>
      </Section>

      {/* Sales Best Practices */}
      <Section style={bestPracticesSection}>
        <Text style={bestPracticesTitle}>🎓 Sales Best Practices:</Text>
        <Text style={bestPracticesList}>
          • <strong>Quick Response:</strong> Contact hot leads within 5 minutes when possible<br />
          • <strong>Value Proposition:</strong> Lead with benefits, not features<br />
          • <strong>Discovery Questions:</strong> Understand pain points and business impact<br />
          • <strong>Next Steps:</strong> Always establish clear next steps and timeline<br />
          • <strong>CRM Updates:</strong> Log all interactions and update opportunity stage<br />
          • <strong>Follow-through:</strong> Honor commitments and deliver on promises
        </Text>
      </Section>

      {/* Sales Metrics Tracking */}
      <Section style={metricsSection}>
        <Text style={metricsTitle}>📊 Sales Performance Tracking</Text>
        <Text style={metricsText}>
          This lead interaction has been logged for sales performance analysis. 
          Tracking response time, conversion rates, and follow-up effectiveness 
          helps optimize your sales process and improve close rates.
        </Text>
      </Section>
    </CallOverviewEmail>
  );
}

// Helper functions for sales operations
function assessLeadQuality(events: any[], transcription?: string): string {
  const content = transcription?.toLowerCase() || '';
  let qualityScore = 0;
  
  // High-quality indicators
  if (content.includes('budget') || content.includes('approved') || content.includes('funding')) qualityScore += 3;
  if (content.includes('decision maker') || content.includes('owner') || content.includes('director')) qualityScore += 3;
  if (content.includes('timeline') || content.includes('urgent') || content.includes('soon')) qualityScore += 2;
  if (content.includes('current vendor') || content.includes('contract expiring')) qualityScore += 2;
  if (content.includes('specific requirements') || content.includes('detailed')) qualityScore += 2;
  
  // Medium-quality indicators
  if (content.includes('interested') || content.includes('looking into')) qualityScore += 1;
  if (content.includes('team') || content.includes('company')) qualityScore += 1;
  
  if (qualityScore >= 8) return 'A+ Lead - Highly Qualified';
  if (qualityScore >= 5) return 'A Lead - Well Qualified';
  if (qualityScore >= 3) return 'B Lead - Moderately Qualified';
  if (qualityScore >= 1) return 'C Lead - Basic Interest';
  
  return 'D Lead - Needs Qualification';
}

function determineBuyingStage(events: any[], transcription?: string): string {
  const content = transcription?.toLowerCase() || '';
  
  if (content.includes('ready to buy') || content.includes('move forward') || 
      content.includes('contract') || content.includes('purchase order')) {
    return 'Decision Stage - Ready to Buy';
  }
  
  if (content.includes('proposal') || content.includes('quote') || 
      content.includes('pricing') || content.includes('demo')) {
    return 'Evaluation Stage - Considering Options';
  }
  
  if (content.includes('requirements') || content.includes('needs assessment') || 
      content.includes('solution') || content.includes('capabilities')) {
    return 'Consideration Stage - Defining Needs';
  }
  
  if (content.includes('research') || content.includes('looking into') || 
      content.includes('exploring') || content.includes('information')) {
    return 'Awareness Stage - Early Research';
  }
  
  return 'Interest Stage - General Inquiry';
}

function extractBudgetIndicators(transcription?: string): string {
  const content = transcription?.toLowerCase() || '';
  
  if (content.includes('no budget') || content.includes('tight budget') || 
      content.includes('limited funding')) {
    return 'Budget Constraints - May need financing options';
  }
  
  if (content.includes('budget approved') || content.includes('funding secured') || 
      content.includes('money allocated')) {
    return 'Budget Confirmed - Ready to proceed';
  }
  
  if (content.includes('budget range') || content.includes('price range') || 
      content.includes('spending') || content.includes('investment')) {
    return 'Budget Discussed - Price-conscious buyer';
  }
  
  if (content.includes('cost') || content.includes('price') || content.includes('expensive')) {
    return 'Price Sensitive - Value justification needed';
  }
  
  return 'Budget Status Unknown - Needs qualification';
}

function assessDecisionAuthority(transcription?: string): string {
  const content = transcription?.toLowerCase() || '';
  
  if (content.includes('owner') || content.includes('ceo') || content.includes('president') || 
      content.includes('decision maker') || content.includes('final say')) {
    return 'Primary Decision Maker - Can authorize purchase';
  }
  
  if (content.includes('manager') || content.includes('director') || content.includes('vp') || 
      content.includes('head of')) {
    return 'Key Influencer - Significant decision authority';
  }
  
  if (content.includes('team') || content.includes('committee') || content.includes('group')) {
    return 'Team Decision - Multiple stakeholders involved';
  }
  
  if (content.includes('need approval') || content.includes('check with') || 
      content.includes('run it by')) {
    return 'Needs Approval - Limited authority';
  }
  
  return 'Authority Level Unknown - Needs qualification';
}

function extractTimeline(events: any[], transcription?: string): string {
  const content = transcription?.toLowerCase() || '';
  
  if (content.includes('immediately') || content.includes('asap') || 
      content.includes('urgent') || content.includes('right away')) {
    return 'Immediate Need - High Priority';
  }
  
  if (content.includes('this month') || content.includes('end of quarter') || 
      content.includes('before year end')) {
    return 'Short-term - Within 30 days';
  }
  
  if (content.includes('next quarter') || content.includes('early next year') || 
      content.includes('few months')) {
    return 'Medium-term - 3-6 months';
  }
  
  if (content.includes('planning') || content.includes('future') || 
      content.includes('down the road')) {
    return 'Long-term - 6+ months';
  }
  
  return 'Timeline Unclear - Needs qualification';
}

function calculateLeadScore(events: any[], transcription?: string): number {
  const content = transcription?.toLowerCase() || '';
  let score = 50; // Base score
  
  // Budget indicators
  if (content.includes('budget approved')) score += 20;
  else if (content.includes('budget')) score += 10;
  
  // Authority indicators
  if (content.includes('owner') || content.includes('ceo')) score += 20;
  else if (content.includes('manager') || content.includes('director')) score += 15;
  
  // Urgency indicators
  if (content.includes('urgent') || content.includes('immediately')) score += 15;
  else if (content.includes('soon') || content.includes('this month')) score += 10;
  
  // Engagement indicators
  if (content.includes('demo') || content.includes('proposal')) score += 10;
  if (content.includes('specific requirements')) score += 5;
  
  // Competition indicators
  if (content.includes('current vendor') || content.includes('contract expiring')) score += 10;
  
  return Math.min(Math.max(score, 0), 100);
}

function extractCompetitiveInfo(transcription?: string): string {
  const content = transcription?.toLowerCase() || '';
  
  if (content.includes('current vendor') || content.includes('currently using') || 
      content.includes('working with')) {
    return 'Competitive Situation - Currently has vendor relationship';
  }
  
  if (content.includes('comparing') || content.includes('looking at options') || 
      content.includes('evaluating')) {
    return 'Competitive Evaluation - Considering multiple vendors';
  }
  
  if (content.includes('not happy') || content.includes('problems with') || 
      content.includes('switching from')) {
    return 'Opportunity - Dissatisfaction with current solution';
  }
  
  return 'Competitive Landscape - Standard evaluation process';
}

function extractCompetitors(transcription?: string): string[] {
  const content = transcription?.toLowerCase() || '';
  const competitors: string[] = [];
  
  // Common competitor names (would be customized per industry)
  const commonCompetitors = ['salesforce', 'hubspot', 'microsoft', 'google', 'adobe', 'oracle'];
  
  commonCompetitors.forEach(competitor => {
    if (content.includes(competitor)) {
      competitors.push(competitor.charAt(0).toUpperCase() + competitor.slice(1));
    }
  });
  
  return competitors;
}

function suggestPipelineStage(events: any[], transcription?: string): string {
  const content = transcription?.toLowerCase() || '';
  
  if (content.includes('ready to buy') || content.includes('move forward')) {
    return 'Negotiation/Close';
  }
  
  if (content.includes('proposal') || content.includes('demo') || content.includes('quote')) {
    return 'Proposal/Presentation';
  }
  
  if (content.includes('requirements') || content.includes('needs assessment')) {
    return 'Discovery/Qualification';
  }
  
  return 'Lead/Qualification';
}

function getRecommendedActions(events: any[], transcription?: string): string {
  const content = transcription?.toLowerCase() || '';
  const actions = [];
  
  if (content.includes('demo')) actions.push('Schedule product demonstration');
  if (content.includes('proposal') || content.includes('quote')) actions.push('Prepare detailed proposal');
  if (content.includes('budget')) actions.push('Discuss pricing and payment options');
  if (content.includes('team') || content.includes('decision maker')) actions.push('Identify all stakeholders');
  if (content.includes('timeline')) actions.push('Confirm project timeline and milestones');
  
  if (actions.length === 0) {
    actions.push('Schedule discovery call to understand needs');
    actions.push('Send relevant case studies and materials');
  }
  
  return actions.join(' • ');
}

function getSalesTip(events: any[]): string {
  const tips = [
    'Always confirm next steps and timeline at the end of each interaction',
    'Ask discovery questions to uncover pain points and business impact',
    'Lead with value and benefits, not features and specifications',
    'Build rapport and trust before presenting solutions',
    'Get commitment on small decisions to build toward the final close',
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
}

function getScoreStyle(score: number): any {
  if (score >= 80) return { color: '#059669', fontWeight: '700' };
  if (score >= 60) return { color: '#f59e0b', fontWeight: '600' };
  return { color: '#dc2626', fontWeight: '500' };
}

// Sales-specific styles
const hotLeadSection = {
  backgroundColor: '#fef2f2',
  border: '3px solid #ef4444',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const hotLeadTitle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#dc2626',
  margin: '0 0 12px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const hotLeadText = {
  fontSize: '14px',
  color: '#7f1d1d',
  margin: '0 0 16px 0',
  lineHeight: '1.5',
};

const hotLeadActions = {
  marginTop: '16px',
};

const hotLeadResponseButton = {
  display: 'inline-block',
  padding: '12px 20px',
  backgroundColor: '#ef4444',
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

const qualificationSection = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fed7aa',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const qualificationTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#c2410c',
  margin: '0 0 16px 0',
};

const qualificationLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#1f2937',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 6px 0',
};

const qualificationText = {
  fontSize: '13px',
  color: '#374151',
  margin: '0 0 12px 0',
  lineHeight: '1.4',
};

const opportunitySection = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const opportunityTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#0c4a6e',
  margin: '0 0 16px 0',
};

const scoreLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#1f2937',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 6px 0',
};

const scoreText = {
  fontSize: '18px',
  margin: '0 0 12px 0',
  fontWeight: '700',
};

const opportunityTip = {
  fontSize: '13px',
  color: '#0c4a6e',
  fontWeight: '500',
  fontStyle: 'italic',
  textAlign: 'center' as const,
  margin: '16px 0 0 0',
  padding: '12px',
  backgroundColor: '#dbeafe',
  borderRadius: '4px',
};

const salesActionsSection = {
  backgroundColor: '#f9fafb',
  border: '1px solid #f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const salesActionsTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#374151',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const salesButton = {
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

const crmButton = {
  backgroundColor: '#059669',
  color: '#ffffff',
};

const proposalButton = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
};

const demoButton = {
  backgroundColor: '#7c3aed',
  color: '#ffffff',
};

const sequenceButton = {
  backgroundColor: '#f59e0b',
  color: '#ffffff',
};

const competitiveSection = {
  backgroundColor: '#fef7f0',
  border: '1px solid #fdba8c',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px',
};

const competitiveTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#c2410c',
  margin: '0 0 10px 0',
};

const competitiveText = {
  fontSize: '13px',
  color: '#ea580c',
  margin: '0 0 10px 0',
  lineHeight: '1.4',
};

const competitiveLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#1f2937',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 6px 0',
};

const competitiveList = {
  fontSize: '13px',
  color: '#ea580c',
  fontWeight: '500',
  margin: '0',
};

const pipelineSection = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const pipelineTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#166534',
  margin: '0 0 16px 0',
};

const pipelineLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#1f2937',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 6px 0',
};

const pipelineText = {
  fontSize: '13px',
  color: '#374151',
  margin: '0 0 12px 0',
  lineHeight: '1.4',
};

const pipelineActions = {
  fontSize: '13px',
  color: '#166534',
  margin: '0',
  lineHeight: '1.5',
};

const bestPracticesSection = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px',
};

const bestPracticesTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#475569',
  margin: '0 0 10px 0',
};

const bestPracticesList = {
  fontSize: '13px',
  color: '#475569',
  margin: '0',
  lineHeight: '1.6',
};

const metricsSection = {
  backgroundColor: '#fafafa',
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px',
};

const metricsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#525252',
  margin: '0 0 10px 0',
};

const metricsText = {
  fontSize: '12px',
  color: '#737373',
  margin: '0',
  lineHeight: '1.5',
};