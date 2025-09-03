import React from 'react';
import CallOverviewEmail, {
  CallOverviewEmailProps,
} from '../CallOverviewEmail';
import { Section, Text, Link, Row, Column } from '@react-email/components';

interface ConsultingEmailProps extends CallOverviewEmailProps {
  // Consulting-specific props
  consultantName?: string;
  specialization?: string[];
  certifications?: string[];
  projectComplexity?: 'low' | 'medium' | 'high' | 'enterprise';
}

export default function ConsultingEmail(props: ConsultingEmailProps) {
  const hasHighValueOpportunity = props.extractedEvents.some(
    (e) => e.urgency === 'high'
  );
  const hasMultipleEngagements = props.extractedEvents.length > 1;

  return (
    <CallOverviewEmail {...props}>
      {/* High-Value Opportunity Alert */}
      {hasHighValueOpportunity && (
        <Section style={highValueSection}>
          <Text style={highValueTitle}>💎 HIGH-VALUE OPPORTUNITY</Text>
          <Text style={highValueText}>
            This consultation indicates a high-value strategic engagement
            opportunity. Complex business challenges typically require
            comprehensive solutions and command premium consulting fees.
          </Text>

          <Row style={highValueActions}>
            <Column>
              <Link
                href={`${props.dashboardUrl}/strategic-response?call=${props.callId}`}
                style={strategicResponseButton}
              >
                🎯 Strategic Response
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

      {/* Business Challenge Assessment */}
      <Section style={challengeSection}>
        <Text style={challengeTitle}>🎯 Business Challenge Analysis</Text>
        <Row>
          <Column>
            <Text style={challengeLabel}>Challenge Category:</Text>
            <Text style={challengeText}>
              {categorizeBusinessChallenge(
                props.extractedEvents,
                props.transcriptionSnippet
              )}
            </Text>
          </Column>
          <Column>
            <Text style={challengeLabel}>Complexity Level:</Text>
            <Text style={challengeText}>
              {assessComplexity(
                props.extractedEvents,
                props.transcriptionSnippet
              )}
            </Text>
          </Column>
        </Row>

        <Text style={challengeLabel}>Strategic Impact:</Text>
        <Text style={challengeText}>
          {assessStrategicImpact(props.transcriptionSnippet)}
        </Text>

        <Text style={challengeLabel}>Stakeholder Involvement:</Text>
        <Text style={challengeText}>
          {identifyStakeholders(props.transcriptionSnippet)}
        </Text>
      </Section>

      {/* Consulting Opportunity Assessment */}
      <Section style={opportunitySection}>
        <Text style={opportunityTitle}>
          💼 Consulting Opportunity Assessment
        </Text>
        <Row>
          <Column>
            <Text style={opportunityLabel}>Engagement Type:</Text>
            <Text style={opportunityText}>
              {determineEngagementType(
                props.extractedEvents,
                props.transcriptionSnippet
              )}
            </Text>
          </Column>
          <Column>
            <Text style={opportunityLabel}>Estimated Duration:</Text>
            <Text style={opportunityText}>
              {estimateEngagementDuration(props.transcriptionSnippet)}
            </Text>
          </Column>
        </Row>

        <Text style={opportunityLabel}>Budget Indicators:</Text>
        <Text style={opportunityText}>
          {extractBudgetSignals(props.transcriptionSnippet)}
        </Text>

        <Text style={consultingTip}>
          💡 Consulting Tip: {getConsultingTip(props.extractedEvents)}
        </Text>
      </Section>

      {/* Consulting Methodology & Approach */}
      <Section style={methodologySection}>
        <Text style={methodologyTitle}>🧠 Recommended Consulting Approach</Text>
        <Text style={methodologyText}>
          Based on the consultation discussion, here's the recommended
          methodology:
        </Text>

        <Text style={phaseTitle}>Phase 1: Discovery & Assessment</Text>
        <Text style={phaseText}>
          • Current state analysis and stakeholder interviews
          <br />
          • Process mapping and pain point identification
          <br />• Competitive benchmarking and industry best practices
        </Text>

        <Text style={phaseTitle}>Phase 2: Strategy Development</Text>
        <Text style={phaseText}>
          • Solution design and strategic recommendations
          <br />
          • Implementation roadmap with milestones
          <br />• Risk assessment and mitigation strategies
        </Text>

        <Text style={phaseTitle}>Phase 3: Implementation Support</Text>
        <Text style={phaseText}>
          • Change management and training programs
          <br />
          • Progress monitoring and course correction
          <br />• Knowledge transfer and sustainability planning
        </Text>
      </Section>

      {/* Consulting Tools & Resources */}
      <Section style={toolsSection}>
        <Text style={toolsTitle}>🛠️ Consulting Management Tools</Text>
        <Row>
          <Column>
            <Link
              href={`${props.dashboardUrl}/proposal-builder?call=${props.callId}`}
              style={{ ...toolButton, ...proposalButton }}
            >
              📊 Proposal Builder
            </Link>
          </Column>
          <Column>
            <Link
              href={`${props.dashboardUrl}/project-scoping?call=${props.callId}`}
              style={{ ...toolButton, ...scopingButton }}
            >
              🎯 Project Scoping
            </Link>
          </Column>
        </Row>
        <Row style={{ marginTop: '8px' }}>
          <Column>
            <Link
              href={`${props.dashboardUrl}/engagement-framework?call=${props.callId}`}
              style={{ ...toolButton, ...frameworkButton }}
            >
              📋 Engagement Framework
            </Link>
          </Column>
          <Column>
            <Link
              href={`${props.dashboardUrl}/roi-calculator?call=${props.callId}`}
              style={{ ...toolButton, ...roiButton }}
            >
              📈 ROI Calculator
            </Link>
          </Column>
        </Row>
      </Section>

      {/* Value Proposition Framework */}
      <Section style={valueSection}>
        <Text style={valueTitle}>💰 Value Proposition Framework</Text>
        <Row>
          <Column>
            <Text style={valueLabel}>Business Impact:</Text>
            <Text style={valueText}>
              {calculateBusinessImpact(props.transcriptionSnippet)}
            </Text>
          </Column>
          <Column>
            <Text style={valueLabel}>ROI Potential:</Text>
            <Text style={valueText}>
              {estimateROIPotential(props.transcriptionSnippet)}
            </Text>
          </Column>
        </Row>

        <Text style={valuePropositionText}>
          <strong>Key Value Drivers:</strong>
          <br />
          {identifyValueDrivers(props.transcriptionSnippet)}
        </Text>
      </Section>

      {/* Competitive Positioning */}
      <Section style={competitiveSection}>
        <Text style={competitiveTitle}>🏆 Competitive Positioning</Text>
        <Text style={competitiveText}>
          {getCompetitivePositioning(props.transcriptionSnippet)}
        </Text>

        <Text style={differentiatorTitle}>Key Differentiators:</Text>
        <Text style={differentiatorText}>
          • Deep industry expertise and proven methodologies
          <br />
          • Data-driven approach with measurable outcomes
          <br />
          • Senior consultant involvement throughout engagement
          <br />
          • Flexible engagement models to fit client needs
          <br />• Post-implementation support and knowledge transfer
        </Text>
      </Section>

      {/* Consulting Best Practices */}
      <Section style={bestPracticesSection}>
        <Text style={bestPracticesTitle}>
          🎓 Consulting Excellence Framework:
        </Text>
        <Text style={bestPracticesList}>
          • <strong>Discovery First:</strong> Understand the real problem before
          proposing solutions
          <br />• <strong>Value-Based Pricing:</strong> Price based on business
          impact, not time
          <br />• <strong>Executive Sponsorship:</strong> Ensure C-level buy-in
          for strategic initiatives
          <br />• <strong>Change Management:</strong> Address people and process
          alongside technology
          <br />• <strong>Measurable Outcomes:</strong> Define success metrics
          upfront
          <br />• <strong>Knowledge Transfer:</strong> Build internal capability
          for sustainability
        </Text>
      </Section>

      {/* Professional Standards */}
      <Section style={standardsSection}>
        <Text style={standardsTitle}>⚖️ Professional Consulting Standards</Text>
        <Text style={standardsText}>
          • All engagements follow established consulting methodologies
          <br />
          • Client confidentiality and non-disclosure agreements strictly
          enforced
          <br />
          • Conflict of interest screening for all new engagements
          <br />
          • Quality assurance and peer review processes
          <br />• Professional liability insurance and ethical standards
          compliance
          {props.consultantName &&
            `<br />• Lead Consultant: ${props.consultantName}`}
          {props.specialization &&
            `<br />• Specializations: ${props.specialization.join(', ')}`}
        </Text>
      </Section>
    </CallOverviewEmail>
  );
}

// Helper functions for consulting practice
function categorizeBusinessChallenge(
  events: any[],
  transcription?: string
): string {
  const content = transcription?.toLowerCase() || '';

  // Strategy & Planning
  if (
    content.includes('strategy') ||
    content.includes('planning') ||
    content.includes('roadmap') ||
    content.includes('vision') ||
    content.includes('competitive')
  ) {
    return 'Strategic Planning & Competitive Positioning';
  }

  // Operations & Process
  if (
    content.includes('process') ||
    content.includes('operations') ||
    content.includes('efficiency') ||
    content.includes('workflow') ||
    content.includes('optimization')
  ) {
    return 'Operational Excellence & Process Optimization';
  }

  // Technology & Digital
  if (
    content.includes('technology') ||
    content.includes('digital') ||
    content.includes('automation') ||
    content.includes('software') ||
    content.includes('system')
  ) {
    return 'Digital Transformation & Technology Implementation';
  }

  // Organizational & Change
  if (
    content.includes('organization') ||
    content.includes('culture') ||
    content.includes('change') ||
    content.includes('leadership') ||
    content.includes('team')
  ) {
    return 'Organizational Development & Change Management';
  }

  // Financial & Performance
  if (
    content.includes('financial') ||
    content.includes('cost') ||
    content.includes('revenue') ||
    content.includes('profit') ||
    content.includes('performance')
  ) {
    return 'Financial Performance & Cost Management';
  }

  // Growth & Market
  if (
    content.includes('growth') ||
    content.includes('market') ||
    content.includes('expansion') ||
    content.includes('acquisition') ||
    content.includes('merger')
  ) {
    return 'Growth Strategy & Market Expansion';
  }

  return 'General Business Consulting';
}

function assessComplexity(events: any[], transcription?: string): string {
  const content = transcription?.toLowerCase() || '';
  let complexityScore = 0;

  // High complexity indicators
  if (
    content.includes('enterprise') ||
    content.includes('global') ||
    content.includes('multi-national')
  )
    complexityScore += 3;
  if (content.includes('transformation') || content.includes('restructure'))
    complexityScore += 3;
  if (
    content.includes('multiple departments') ||
    content.includes('cross-functional')
  )
    complexityScore += 2;
  if (content.includes('regulatory') || content.includes('compliance'))
    complexityScore += 2;
  if (content.includes('integration') || content.includes('merger'))
    complexityScore += 2;

  // Medium complexity indicators
  if (
    content.includes('process improvement') ||
    content.includes('optimization')
  )
    complexityScore += 1;
  if (content.includes('team') || content.includes('department'))
    complexityScore += 1;

  if (complexityScore >= 6)
    return 'Enterprise - Large-scale organizational transformation';
  if (complexityScore >= 4)
    return 'High - Complex multi-stakeholder engagement';
  if (complexityScore >= 2) return 'Medium - Department-level improvements';

  return 'Standard - Focused process or strategy work';
}

function assessStrategicImpact(transcription?: string): string {
  const content = transcription?.toLowerCase() || '';

  if (
    content.includes('mission critical') ||
    content.includes('strategic priority') ||
    content.includes('company future') ||
    content.includes('survival')
  ) {
    return 'Mission Critical - Core business impact';
  }

  if (
    content.includes('competitive advantage') ||
    content.includes('market position') ||
    content.includes('significant impact')
  ) {
    return 'High Strategic Value - Competitive differentiation';
  }

  if (
    content.includes('efficiency gains') ||
    content.includes('cost savings') ||
    content.includes('performance improvement')
  ) {
    return 'Operational Impact - Process and performance gains';
  }

  return 'Tactical Impact - Specific problem solving';
}

function identifyStakeholders(transcription?: string): string {
  const content = transcription?.toLowerCase() || '';
  const stakeholders = [];

  if (
    content.includes('ceo') ||
    content.includes('president') ||
    content.includes('owner')
  ) {
    stakeholders.push('C-Suite Executive');
  }

  if (content.includes('board') || content.includes('investors')) {
    stakeholders.push('Board/Investors');
  }

  if (
    content.includes('department heads') ||
    content.includes('directors') ||
    content.includes('vp')
  ) {
    stakeholders.push('Senior Management');
  }

  if (content.includes('team leads') || content.includes('managers')) {
    stakeholders.push('Middle Management');
  }

  if (
    content.includes('employees') ||
    content.includes('staff') ||
    content.includes('workforce')
  ) {
    stakeholders.push('Front-line Employees');
  }

  if (stakeholders.length === 0) return 'Stakeholders to be identified';

  return stakeholders.join(', ') + ' - Multi-level engagement required';
}

function determineEngagementType(
  events: any[],
  transcription?: string
): string {
  const content = transcription?.toLowerCase() || '';

  if (
    content.includes('ongoing') ||
    content.includes('retained') ||
    content.includes('long term')
  ) {
    return 'Retained Consulting - Long-term partnership';
  }

  if (
    content.includes('project') ||
    content.includes('specific deliverable') ||
    content.includes('fixed scope')
  ) {
    return 'Project-Based - Defined scope and timeline';
  }

  if (
    content.includes('assessment') ||
    content.includes('audit') ||
    content.includes('evaluation')
  ) {
    return 'Assessment & Diagnosis - Current state analysis';
  }

  if (
    content.includes('workshop') ||
    content.includes('training') ||
    content.includes('facilitation')
  ) {
    return 'Facilitation & Training - Knowledge transfer focus';
  }

  if (
    content.includes('interim') ||
    content.includes('temporary') ||
    content.includes('fractional')
  ) {
    return 'Interim Management - Executive placement';
  }

  return 'Strategic Consulting - Advisory services';
}

function estimateEngagementDuration(transcription?: string): string {
  const content = transcription?.toLowerCase() || '';

  if (
    content.includes('quick') ||
    content.includes('urgent') ||
    content.includes('immediate')
  ) {
    return '2-4 weeks - Sprint engagement';
  }

  if (
    content.includes('this quarter') ||
    content.includes('few months') ||
    content.includes('short term')
  ) {
    return '1-3 months - Tactical project';
  }

  if (
    content.includes('transformation') ||
    content.includes('major initiative') ||
    content.includes('comprehensive')
  ) {
    return '6-12 months - Strategic transformation';
  }

  if (
    content.includes('ongoing') ||
    content.includes('retained') ||
    content.includes('partnership')
  ) {
    return '12+ months - Long-term partnership';
  }

  return '3-6 months - Standard engagement';
}

function extractBudgetSignals(transcription?: string): string {
  const content = transcription?.toLowerCase() || '';

  if (
    content.includes('significant investment') ||
    content.includes('major initiative') ||
    content.includes('substantial budget')
  ) {
    return 'High Budget Allocation - Major investment approved';
  }

  if (
    content.includes('budget allocated') ||
    content.includes('funding secured') ||
    content.includes('approved spend')
  ) {
    return 'Budget Confirmed - Funding in place';
  }

  if (
    content.includes('cost conscious') ||
    content.includes('tight budget') ||
    content.includes('limited funds')
  ) {
    return 'Budget Constrained - Value-focused engagement needed';
  }

  if (
    content.includes('roi') ||
    content.includes('return on investment') ||
    content.includes('payback')
  ) {
    return 'ROI Focused - Business case required';
  }

  return 'Budget Discussion Needed - Investment level to be determined';
}

function calculateBusinessImpact(transcription?: string): string {
  const content = transcription?.toLowerCase() || '';

  if (
    content.includes('millions') ||
    content.includes('enterprise wide') ||
    content.includes('company transformation')
  ) {
    return 'High Impact - Multi-million dollar opportunity';
  }

  if (
    content.includes('department') ||
    content.includes('significant improvement') ||
    content.includes('cost savings')
  ) {
    return 'Medium Impact - Department-level improvements';
  }

  return 'Standard Impact - Process and efficiency gains';
}

function estimateROIPotential(transcription?: string): string {
  const content = transcription?.toLowerCase() || '';

  if (
    content.includes('cost reduction') ||
    content.includes('efficiency') ||
    content.includes('automation')
  ) {
    return '3-5x ROI - Cost reduction focus';
  }

  if (
    content.includes('revenue growth') ||
    content.includes('market expansion') ||
    content.includes('competitive advantage')
  ) {
    return '5-10x ROI - Revenue generation focus';
  }

  return 'ROI Analysis Required - To be quantified';
}

function identifyValueDrivers(transcription?: string): string {
  const content = transcription?.toLowerCase() || '';
  const drivers = [];

  if (content.includes('cost') || content.includes('efficiency'))
    drivers.push('Cost reduction and efficiency gains');
  if (content.includes('revenue') || content.includes('growth'))
    drivers.push('Revenue growth and market expansion');
  if (content.includes('risk') || content.includes('compliance'))
    drivers.push('Risk mitigation and compliance');
  if (content.includes('speed') || content.includes('agility'))
    drivers.push('Improved agility and time-to-market');
  if (content.includes('quality') || content.includes('excellence'))
    drivers.push('Quality improvement and operational excellence');

  if (drivers.length === 0)
    return 'Value drivers to be identified during discovery';

  return drivers.join(' • ');
}

function getCompetitivePositioning(transcription?: string): string {
  const content = transcription?.toLowerCase() || '';

  if (
    content.includes('big four') ||
    content.includes('mckinsey') ||
    content.includes('bain') ||
    content.includes('deloitte') ||
    content.includes('pwc')
  ) {
    return 'Competing with tier-1 consulting firms - Emphasize specialized expertise and partner-level attention';
  }

  if (
    content.includes('boutique') ||
    content.includes('specialist') ||
    content.includes('niche')
  ) {
    return 'Boutique consulting landscape - Highlight deep expertise and personalized service';
  }

  if (
    content.includes('internal team') ||
    content.includes('in-house') ||
    content.includes('build vs buy')
  ) {
    return 'Build vs. buy decision - Emphasize speed, expertise, and proven methodologies';
  }

  return 'Standard competitive environment - Focus on unique methodology and proven results';
}

function getConsultingTip(events: any[]): string {
  const tips = [
    'Always start with discovery - understand the real problem before proposing solutions',
    'Price based on value and business impact, not time invested',
    'Secure executive sponsorship early for strategic initiatives',
    'Build internal capability alongside delivering results',
    'Define success metrics and measurement framework upfront',
  ];

  return tips[Math.floor(Math.random() * tips.length)];
}

// Consulting-specific styles
const highValueSection = {
  backgroundColor: '#fef3e2',
  border: '3px solid #f59e0b',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const highValueTitle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#92400e',
  margin: '0 0 12px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const highValueText = {
  fontSize: '14px',
  color: '#78350f',
  margin: '0 0 16px 0',
  lineHeight: '1.5',
};

const highValueActions = {
  marginTop: '16px',
};

const strategicResponseButton = {
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

const challengeSection = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const challengeTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#374151',
  margin: '0 0 16px 0',
};

const challengeLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#1f2937',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 6px 0',
};

const challengeText = {
  fontSize: '13px',
  color: '#374151',
  margin: '0 0 12px 0',
  lineHeight: '1.4',
};

const opportunitySection = {
  backgroundColor: '#f0f4ff',
  border: '1px solid #c7d2fe',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const opportunityTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#3730a3',
  margin: '0 0 16px 0',
};

const opportunityLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#1f2937',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 6px 0',
};

const opportunityText = {
  fontSize: '13px',
  color: '#374151',
  margin: '0 0 12px 0',
  lineHeight: '1.4',
};

const consultingTip = {
  fontSize: '13px',
  color: '#3730a3',
  fontWeight: '500',
  fontStyle: 'italic',
  textAlign: 'center' as const,
  margin: '16px 0 0 0',
  padding: '12px',
  backgroundColor: '#e0e7ff',
  borderRadius: '4px',
};

const methodologySection = {
  backgroundColor: '#f9fafb',
  border: '1px solid #f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const methodologyTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#374151',
  margin: '0 0 12px 0',
};

const methodologyText = {
  fontSize: '14px',
  color: '#4b5563',
  margin: '0 0 16px 0',
  lineHeight: '1.5',
};

const phaseTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '12px 0 6px 0',
};

const phaseText = {
  fontSize: '13px',
  color: '#374151',
  margin: '0 0 12px 0',
  lineHeight: '1.5',
};

const toolsSection = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const toolsTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#166534',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const toolButton = {
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

const proposalButton = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
};

const scopingButton = {
  backgroundColor: '#7c3aed',
  color: '#ffffff',
};

const frameworkButton = {
  backgroundColor: '#059669',
  color: '#ffffff',
};

const roiButton = {
  backgroundColor: '#dc2626',
  color: '#ffffff',
};

const valueSection = {
  backgroundColor: '#fefbf2',
  border: '1px solid #fed7aa',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const valueTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#c2410c',
  margin: '0 0 16px 0',
};

const valueLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#1f2937',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 6px 0',
};

const valueText = {
  fontSize: '13px',
  color: '#374151',
  margin: '0 0 12px 0',
  lineHeight: '1.4',
};

const valuePropositionText = {
  fontSize: '14px',
  color: '#c2410c',
  margin: '12px 0 0 0',
  lineHeight: '1.5',
};

const competitiveSection = {
  backgroundColor: '#fdf4ff',
  border: '1px solid #e9d5ff',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px',
};

const competitiveTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#7c2d12',
  margin: '0 0 10px 0',
};

const competitiveText = {
  fontSize: '13px',
  color: '#a16207',
  margin: '0 0 12px 0',
  lineHeight: '1.4',
};

const differentiatorTitle = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#1f2937',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '12px 0 6px 0',
};

const differentiatorText = {
  fontSize: '13px',
  color: '#a16207',
  margin: '0',
  lineHeight: '1.6',
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

const standardsSection = {
  backgroundColor: '#fafafa',
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px',
};

const standardsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#525252',
  margin: '0 0 10px 0',
};

const standardsText = {
  fontSize: '12px',
  color: '#737373',
  margin: '0',
  lineHeight: '1.5',
};
