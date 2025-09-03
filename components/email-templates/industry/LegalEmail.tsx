import React from 'react';
import CallOverviewEmail, {
  CallOverviewEmailProps,
} from '../CallOverviewEmail';
import { Section, Text, Link, Row, Column } from '@react-email/components';

interface LegalEmailProps extends CallOverviewEmailProps {
  // Legal-specific props
  attorneyBarNumber?: string;
  lawFirm?: string;
  practiceAreas?: string[];
  confidentialityRequired?: boolean;
}

export default function LegalEmail(props: LegalEmailProps) {
  const hasUrgentEvents = props.extractedEvents.some(
    (e) => e.urgency === 'emergency' || e.urgency === 'high'
  );
  const requiresPrivilege =
    props.confidentialityRequired ||
    props.transcriptionSnippet?.toLowerCase().includes('confidential') ||
    props.transcriptionSnippet?.toLowerCase().includes('privileged');

  return (
    <CallOverviewEmail {...props}>
      {/* Attorney-Client Privilege Notice */}
      {requiresPrivilege && (
        <Section style={privilegeNoticeSection}>
          <Text style={privilegeTitle}>
            ⚖️ ATTORNEY-CLIENT PRIVILEGE NOTICE
          </Text>
          <Text style={privilegeText}>
            This communication contains confidential attorney-client privileged
            information. Access is restricted to authorized personnel only.
            Review confidentiality requirements before sharing or discussing
            case details.
          </Text>

          <Row style={privilegeActions}>
            <Column>
              <Link
                href={`${props.dashboardUrl}/confidential-review?call=${props.callId}`}
                style={confidentialReviewButton}
              >
                🔒 Confidential Review
              </Link>
            </Column>
            <Column>
              <Link
                href={`${props.dashboardUrl}/conflict-check?call=${props.callId}`}
                style={conflictCheckButton}
              >
                ⚖️ Conflict Check
              </Link>
            </Column>
          </Row>
        </Section>
      )}

      {/* Urgent Legal Matter Alert */}
      {hasUrgentEvents && (
        <Section style={urgentLegalSection}>
          <Text style={urgentLegalTitle}>🚨 URGENT LEGAL MATTER</Text>
          <Text style={urgentLegalText}>
            This consultation contains time-sensitive legal issues requiring
            immediate attention. Statute of limitations, court deadlines, or
            emergency circumstances may be involved.
          </Text>

          <Row style={urgentActions}>
            <Column>
              <Link
                href={`${props.dashboardUrl}/urgent-response?call=${props.callId}`}
                style={urgentResponseButton}
              >
                ⚡ Priority Response
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

      {/* Legal Matter Classification */}
      <Section style={matterClassificationSection}>
        <Text style={classificationTitle}>📋 Legal Matter Classification</Text>
        <Row>
          <Column>
            <Text style={classificationLabel}>Practice Area:</Text>
            <Text style={classificationText}>
              {determinePracticeArea(
                props.extractedEvents,
                props.transcriptionSnippet
              )}
            </Text>
          </Column>
          <Column>
            <Text style={classificationLabel}>Matter Type:</Text>
            <Text style={classificationText}>
              {determineMatterType(
                props.extractedEvents,
                props.transcriptionSnippet
              )}
            </Text>
          </Column>
        </Row>

        <Text style={classificationLabel}>Complexity Assessment:</Text>
        <Text style={classificationText}>
          {assessComplexity(props.extractedEvents, props.transcriptionSnippet)}
        </Text>

        <Text style={classificationLabel}>Potential Conflicts:</Text>
        <Text style={classificationText}>
          {assessPotentialConflicts(props.transcriptionSnippet)}
        </Text>
      </Section>

      {/* Consultation Management */}
      <Section style={consultationSection}>
        <Text style={consultationTitle}>⏰ Consultation Management</Text>
        <Row>
          <Column>
            <Text style={consultationLabel}>Response Priority:</Text>
            <Text style={consultationText}>
              {hasUrgentEvents ? 'IMMEDIATE (< 2 hours)' : 'Within 24 hours'}
            </Text>
          </Column>
          <Column>
            <Text style={consultationLabel}>Meeting Format:</Text>
            <Text style={consultationText}>
              In-person preferred for sensitive matters
              <br />
              Video consultation available
            </Text>
          </Column>
        </Row>

        <Text style={consultationTip}>
          💡 Legal Tip: {getLegalTip(props.extractedEvents)}
        </Text>
      </Section>

      {/* Client Intake Tools */}
      <Section style={intakeSection}>
        <Text style={intakeTitle}>📝 Client Intake & Case Management</Text>
        <Row>
          <Column>
            <Link
              href={`${props.dashboardUrl}/intake-form?call=${props.callId}`}
              style={{ ...intakeButton, ...intakeFormButton }}
            >
              📋 Intake Form
            </Link>
          </Column>
          <Column>
            <Link
              href={`${props.dashboardUrl}/retainer-agreement?call=${props.callId}`}
              style={{ ...intakeButton, ...retainerButton }}
            >
              📄 Retainer Agreement
            </Link>
          </Column>
        </Row>
        <Row style={{ marginTop: '8px' }}>
          <Column>
            <Link
              href={`${props.dashboardUrl}/case-evaluation?call=${props.callId}`}
              style={{ ...intakeButton, ...evaluationButton }}
            >
              ⚖️ Case Evaluation
            </Link>
          </Column>
          <Column>
            <Link
              href={`${props.dashboardUrl}/fee-calculator?call=${props.callId}`}
              style={{ ...intakeButton, ...feeButton }}
            >
              💰 Fee Calculator
            </Link>
          </Column>
        </Row>
      </Section>

      {/* Professional Standards & Compliance */}
      <Section style={complianceSection}>
        <Text style={complianceTitle}>⚖️ Professional Standards & Ethics</Text>
        <Text style={complianceText}>
          • All communications subject to attorney-client privilege
          <br />
          • Conflict of interest screening required before representation
          <br />
          • Client confidentiality strictly maintained per professional rules
          <br />
          • Fee arrangements must comply with state bar regulations
          <br />• All consultations logged for professional responsibility
          compliance
          {props.attorneyBarNumber &&
            `<br />• Attorney Bar Number: ${props.attorneyBarNumber}`}
          {props.lawFirm && `<br />• Law Firm: ${props.lawFirm}`}
        </Text>
      </Section>

      {/* Legal Practice Management Tips */}
      <Section style={practiceManagementSection}>
        <Text style={practiceManagementTitle}>
          🎓 Legal Practice Management Tips:
        </Text>
        <Text style={practiceManagementList}>
          • <strong>Intake Process:</strong> Complete conflict check before
          consultation
          <br />• <strong>Documentation:</strong> Maintain detailed records from
          initial contact
          <br />• <strong>Fee Agreements:</strong> Discuss fees and payment
          terms upfront
          <br />• <strong>Deadlines:</strong> Calendar all potential statute
          limitations immediately
          <br />• <strong>Communication:</strong> Set clear expectations for
          response times
          <br />• <strong>Referrals:</strong> Know when to refer matters outside
          your expertise
        </Text>
      </Section>
    </CallOverviewEmail>
  );
}

// Helper functions for legal practice
function determinePracticeArea(events: any[], transcription?: string): string {
  const content = transcription?.toLowerCase() || '';

  // Family Law
  if (
    content.includes('divorce') ||
    content.includes('custody') ||
    content.includes('child support') ||
    content.includes('alimony') ||
    content.includes('prenup')
  )
    return 'Family Law';

  // Criminal Law
  if (
    content.includes('arrest') ||
    content.includes('criminal') ||
    content.includes('charged') ||
    content.includes('police') ||
    content.includes('court date')
  )
    return 'Criminal Defense';

  // Personal Injury
  if (
    content.includes('accident') ||
    content.includes('injury') ||
    content.includes('insurance') ||
    content.includes('medical bills') ||
    content.includes('car accident')
  )
    return 'Personal Injury';

  // Estate Planning
  if (
    content.includes('will') ||
    content.includes('estate') ||
    content.includes('trust') ||
    content.includes('probate') ||
    content.includes('inheritance')
  )
    return 'Estate Planning';

  // Business Law
  if (
    content.includes('business') ||
    content.includes('contract') ||
    content.includes('llc') ||
    content.includes('corporation') ||
    content.includes('partnership')
  )
    return 'Business Law';

  // Employment Law
  if (
    content.includes('employment') ||
    content.includes('fired') ||
    content.includes('workplace') ||
    content.includes('discrimination') ||
    content.includes('wrongful termination')
  )
    return 'Employment Law';

  // Real Estate Law
  if (
    content.includes('property') ||
    content.includes('real estate') ||
    content.includes('closing') ||
    content.includes('deed') ||
    content.includes('landlord')
  )
    return 'Real Estate Law';

  return 'General Legal Consultation';
}

function determineMatterType(events: any[], transcription?: string): string {
  const content = transcription?.toLowerCase() || '';

  if (
    content.includes('initial consultation') ||
    content.includes('first time') ||
    content.includes('need a lawyer')
  )
    return 'Initial Consultation';

  if (
    content.includes('ongoing') ||
    content.includes('current case') ||
    content.includes('already working')
  )
    return 'Ongoing Case';

  if (
    content.includes('emergency') ||
    content.includes('urgent') ||
    content.includes('deadline') ||
    content.includes('court tomorrow')
  )
    return 'Emergency Legal Matter';

  if (
    content.includes('review') ||
    content.includes('look at') ||
    content.includes('opinion')
  )
    return 'Legal Review';

  if (
    content.includes('mediation') ||
    content.includes('settlement') ||
    content.includes('negotiate')
  )
    return 'Dispute Resolution';

  return 'General Legal Inquiry';
}

function assessComplexity(events: any[], transcription?: string): string {
  const content = transcription?.toLowerCase() || '';
  let complexityScore = 0;

  // High complexity indicators
  if (content.includes('multiple parties') || content.includes('class action'))
    complexityScore += 3;
  if (content.includes('federal') || content.includes('appeal'))
    complexityScore += 3;
  if (content.includes('criminal') && content.includes('felony'))
    complexityScore += 3;
  if (content.includes('corporate') || content.includes('merger'))
    complexityScore += 2;
  if (content.includes('international') || content.includes('jurisdiction'))
    complexityScore += 2;

  // Medium complexity indicators
  if (content.includes('litigation') || content.includes('lawsuit'))
    complexityScore += 2;
  if (content.includes('contract dispute') || content.includes('breach'))
    complexityScore += 1;
  if (content.includes('custody') || content.includes('divorce'))
    complexityScore += 1;

  if (complexityScore >= 5)
    return 'High Complexity - Specialized expertise required';
  if (complexityScore >= 3)
    return 'Medium Complexity - Detailed case management needed';
  if (complexityScore >= 1) return 'Standard Complexity - Routine legal matter';

  return 'Low Complexity - Straightforward consultation';
}

function assessPotentialConflicts(transcription?: string): string {
  const content = transcription?.toLowerCase() || '';

  if (
    content.includes('former client') ||
    content.includes('used to represent')
  ) {
    return 'POTENTIAL CONFLICT: Former client mentioned';
  }

  if (content.includes('opposing party') || content.includes('other side')) {
    return 'REVIEW REQUIRED: Multiple parties involved';
  }

  if (content.includes('company') && content.includes('employee')) {
    return 'SCREENING NEEDED: Employment matter with corporate entity';
  }

  if (
    content.includes('government') ||
    content.includes('city') ||
    content.includes('county')
  ) {
    return 'GOVERNMENT INVOLVEMENT: Additional conflict screening required';
  }

  return 'No obvious conflicts identified - Standard screening recommended';
}

function getLegalTip(events: any[]): string {
  const tips = [
    'Document the consultation date and time for potential statute of limitations',
    'Verify client identity and authorize representation before sharing legal advice',
    'Consider fee structure and retainer requirements for complex matters',
    'Screen for conflicts of interest with all parties mentioned',
    'Maintain confidentiality even in preliminary consultations',
  ];

  return tips[Math.floor(Math.random() * tips.length)];
}

// Legal-specific styles
const privilegeNoticeSection = {
  backgroundColor: '#fef3c7',
  border: '3px solid #d97706',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const privilegeTitle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#92400e',
  margin: '0 0 12px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const privilegeText = {
  fontSize: '14px',
  color: '#78350f',
  margin: '0 0 16px 0',
  lineHeight: '1.5',
  fontWeight: '500',
};

const privilegeActions = {
  marginTop: '16px',
};

const confidentialReviewButton = {
  display: 'inline-block',
  padding: '12px 20px',
  backgroundColor: '#d97706',
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

const conflictCheckButton = {
  display: 'inline-block',
  padding: '12px 20px',
  backgroundColor: '#7c3aed',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '14px',
  textAlign: 'center' as const,
  width: '100%',
  boxSizing: 'border-box' as const,
};

const urgentLegalSection = {
  backgroundColor: '#fef2f2',
  border: '2px solid #dc2626',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const urgentLegalTitle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#dc2626',
  margin: '0 0 12px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const urgentLegalText = {
  fontSize: '14px',
  color: '#7f1d1d',
  margin: '0 0 16px 0',
  lineHeight: '1.5',
};

const urgentActions = {
  marginTop: '16px',
};

const urgentResponseButton = {
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

const matterClassificationSection = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const classificationTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#374151',
  margin: '0 0 16px 0',
};

const classificationLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#1f2937',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 6px 0',
};

const classificationText = {
  fontSize: '13px',
  color: '#374151',
  margin: '0 0 12px 0',
  lineHeight: '1.4',
};

const consultationSection = {
  backgroundColor: '#f0f4ff',
  border: '1px solid #c7d2fe',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const consultationTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#3730a3',
  margin: '0 0 16px 0',
};

const consultationLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#1f2937',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 6px 0',
};

const consultationText = {
  fontSize: '13px',
  color: '#374151',
  margin: '0 0 12px 0',
  lineHeight: '1.4',
};

const consultationTip = {
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

const intakeSection = {
  backgroundColor: '#f9fafb',
  border: '1px solid #f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const intakeTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#374151',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const intakeButton = {
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

const intakeFormButton = {
  backgroundColor: '#7c3aed',
  color: '#ffffff',
};

const retainerButton = {
  backgroundColor: '#059669',
  color: '#ffffff',
};

const evaluationButton = {
  backgroundColor: '#dc2626',
  color: '#ffffff',
};

const feeButton = {
  backgroundColor: '#f59e0b',
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

const practiceManagementSection = {
  backgroundColor: '#fdf4ff',
  border: '1px solid #e9d5ff',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px',
};

const practiceManagementTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#7c2d12',
  margin: '0 0 10px 0',
};

const practiceManagementList = {
  fontSize: '13px',
  color: '#7c2d12',
  margin: '0',
  lineHeight: '1.6',
};
