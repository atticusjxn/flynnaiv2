import React from 'react';
import CallOverviewEmail, {
  CallOverviewEmailProps,
} from '../CallOverviewEmail';
import { Section, Text, Link, Row, Column } from '@react-email/components';

interface MedicalEmailProps extends CallOverviewEmailProps {
  // Medical-specific props
  providerNPI?: string;
  medicalFacility?: string;
  specialties?: string[];
  hipaaCompliant?: boolean;
}

export default function MedicalEmail(props: MedicalEmailProps) {
  const hasUrgentEvents = props.extractedEvents.some(
    (e) => e.urgency === 'emergency' || e.urgency === 'high'
  );
  const hasEmergencyEvents = props.extractedEvents.some(
    (e) => e.urgency === 'emergency'
  );

  return (
    <CallOverviewEmail {...props}>
      {/* HIPAA Compliance Notice */}
      <Section style={hipaaNoticeSection}>
        <Text style={hipaaTitle}>🏥 HIPAA COMPLIANCE NOTICE</Text>
        <Text style={hipaaText}>
          This communication contains limited patient health information. No
          detailed medical information is stored. All communications are
          processed in compliance with HIPAA regulations for protected health
          information (PHI).
        </Text>

        <Text style={hipaaDisclaimer}>
          ⚠️ Patient identity verification required before discussing specific
          medical conditions
        </Text>
      </Section>

      {/* Medical Emergency Alert */}
      {hasEmergencyEvents && (
        <Section style={emergencyMedicalSection}>
          <Text style={emergencyMedicalTitle}>🚨 MEDICAL EMERGENCY ALERT</Text>
          <Text style={emergencyMedicalText}>
            This call contains potential medical emergency situations requiring
            immediate attention. Life-threatening conditions or urgent medical
            needs may require priority scheduling or emergency department
            referral.
          </Text>

          <Row style={emergencyActions}>
            <Column>
              <Link
                href={`${props.dashboardUrl}/emergency-response?call=${props.callId}`}
                style={emergencyResponseButton}
              >
                🚨 Emergency Protocol
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

      {/* Urgent Care Alert */}
      {hasUrgentEvents && !hasEmergencyEvents && (
        <Section style={urgentCareSection}>
          <Text style={urgentCareTitle}>⏰ URGENT CARE NEEDED</Text>
          <Text style={urgentCareText}>
            This appointment request indicates urgent medical care needs.
            Priority scheduling recommended within 24 hours.
          </Text>
        </Section>
      )}

      {/* Patient Care Classification */}
      <Section style={careClassificationSection}>
        <Text style={classificationTitle}>🩺 Patient Care Assessment</Text>
        <Row>
          <Column>
            <Text style={classificationLabel}>Visit Type:</Text>
            <Text style={classificationText}>
              {determineVisitType(
                props.extractedEvents,
                props.transcriptionSnippet
              )}
            </Text>
          </Column>
          <Column>
            <Text style={classificationLabel}>Specialty Needed:</Text>
            <Text style={classificationText}>
              {determineSpecialty(
                props.extractedEvents,
                props.transcriptionSnippet
              )}
            </Text>
          </Column>
        </Row>

        <Text style={classificationLabel}>Chief Concern Category:</Text>
        <Text style={classificationText}>
          {categorizeChiefConcern(props.transcriptionSnippet)}
        </Text>

        <Text style={classificationLabel}>Insurance/Payment:</Text>
        <Text style={classificationText}>
          {extractInsuranceInfo(props.transcriptionSnippet)}
        </Text>
      </Section>

      {/* Appointment Management */}
      <Section style={appointmentSection}>
        <Text style={appointmentTitle}>📅 Appointment Management</Text>
        <Row>
          <Column>
            <Text style={appointmentLabel}>Scheduling Priority:</Text>
            <Text style={appointmentText}>
              {hasEmergencyEvents
                ? 'STAT (immediate)'
                : hasUrgentEvents
                  ? 'Urgent (< 24 hours)'
                  : 'Routine (within 1 week)'}
            </Text>
          </Column>
          <Column>
            <Text style={appointmentLabel}>Appointment Duration:</Text>
            <Text style={appointmentText}>
              {determineAppointmentDuration(
                props.extractedEvents,
                props.transcriptionSnippet
              )}
            </Text>
          </Column>
        </Row>

        <Text style={medicalTip}>
          💡 Clinical Tip: {getMedicalTip(props.extractedEvents)}
        </Text>
      </Section>

      {/* Patient Care Tools */}
      <Section style={careToolsSection}>
        <Text style={careToolsTitle}>🩺 Patient Care Management</Text>
        <Row>
          <Column>
            <Link
              href={`${props.dashboardUrl}/patient-intake?call=${props.callId}`}
              style={{ ...careButton, ...intakeButton }}
            >
              📋 Patient Intake
            </Link>
          </Column>
          <Column>
            <Link
              href={`${props.dashboardUrl}/insurance-verification?call=${props.callId}`}
              style={{ ...careButton, ...insuranceButton }}
            >
              💳 Insurance Check
            </Link>
          </Column>
        </Row>
        <Row style={{ marginTop: '8px' }}>
          <Column>
            <Link
              href={`${props.dashboardUrl}/appointment-scheduler?call=${props.callId}`}
              style={{ ...careButton, ...schedulerButton }}
            >
              📅 Schedule Appointment
            </Link>
          </Column>
          <Column>
            <Link
              href={`${props.dashboardUrl}/pre-visit-forms?call=${props.callId}`}
              style={{ ...careButton, ...formsButton }}
            >
              📄 Pre-Visit Forms
            </Link>
          </Column>
        </Row>
      </Section>

      {/* HIPAA & Compliance Information */}
      <Section style={complianceSection}>
        <Text style={complianceTitle}>🔒 HIPAA & Medical Compliance</Text>
        <Text style={complianceText}>
          • All patient communications protected under HIPAA regulations
          <br />
          • Patient consent required for appointment confirmations
          <br />
          • Medical records access restricted to authorized personnel
          <br />
          • Scheduling system maintains audit trail for compliance
          <br />• Patient identity verification required before medical
          discussions
          {props.providerNPI && `<br />• Provider NPI: ${props.providerNPI}`}
          {props.medicalFacility &&
            `<br />• Medical Facility: ${props.medicalFacility}`}
        </Text>
      </Section>

      {/* Medical Office Best Practices */}
      <Section style={bestPracticesSection}>
        <Text style={bestPracticesTitle}>
          🏥 Medical Office Best Practices:
        </Text>
        <Text style={bestPracticesList}>
          • <strong>Patient Verification:</strong> Verify identity with DOB and
          address
          <br />• <strong>Insurance Authorization:</strong> Check coverage
          before visit
          <br />• <strong>Medical History:</strong> Review previous visits and
          medications
          <br />• <strong>Appointment Prep:</strong> Send pre-visit forms and
          instructions
          <br />• <strong>Follow-up Care:</strong> Schedule appropriate
          follow-up visits
          <br />• <strong>Emergency Protocol:</strong> Direct emergencies to
          appropriate care level
        </Text>
      </Section>

      {/* Patient Safety Reminders */}
      <Section style={safetySection}>
        <Text style={safetyTitle}>⚠️ Patient Safety Reminders</Text>
        <Text style={safetyText}>
          • Medical emergencies should be directed to call 911 or visit
          emergency department
          <br />
          • Urgent symptoms requiring same-day evaluation should be triaged by
          clinical staff
          <br />
          • Prescription refills and medication questions require provider
          review
          <br />• Test results and diagnostic follow-ups need secure patient
          portal communication
        </Text>
      </Section>
    </CallOverviewEmail>
  );
}

// Helper functions for medical practice
function determineVisitType(events: any[], transcription?: string): string {
  const content = transcription?.toLowerCase() || '';

  if (
    content.includes('new patient') ||
    content.includes('first visit') ||
    content.includes('never been')
  )
    return 'New Patient Visit';

  if (
    content.includes('follow up') ||
    content.includes('follow-up') ||
    content.includes('check up') ||
    content.includes('recheck')
  )
    return 'Follow-up Visit';

  if (
    content.includes('physical') ||
    content.includes('annual') ||
    content.includes('yearly') ||
    content.includes('wellness')
  )
    return 'Preventive Care Visit';

  if (
    content.includes('sick') ||
    content.includes('symptoms') ||
    content.includes('pain') ||
    content.includes('problem')
  )
    return 'Problem-Focused Visit';

  if (
    content.includes('procedure') ||
    content.includes('surgery') ||
    content.includes('biopsy') ||
    content.includes('injection')
  )
    return 'Procedure Visit';

  if (
    content.includes('urgent') ||
    content.includes("can't wait") ||
    content.includes('getting worse')
  )
    return 'Urgent Care Visit';

  return 'General Medical Visit';
}

function determineSpecialty(events: any[], transcription?: string): string {
  const content = transcription?.toLowerCase() || '';

  // Cardiology
  if (
    content.includes('heart') ||
    content.includes('chest pain') ||
    content.includes('cardiology') ||
    content.includes('blood pressure')
  )
    return 'Cardiology';

  // Dermatology
  if (
    content.includes('skin') ||
    content.includes('rash') ||
    content.includes('dermatology') ||
    content.includes('mole')
  )
    return 'Dermatology';

  // Orthopedics
  if (
    content.includes('bone') ||
    content.includes('joint') ||
    content.includes('orthopedic') ||
    content.includes('fracture')
  )
    return 'Orthopedics';

  // OB/GYN
  if (
    content.includes('gynecology') ||
    content.includes('pregnancy') ||
    content.includes('obstetrics') ||
    content.includes("women's health")
  )
    return 'OB/GYN';

  // Pediatrics
  if (
    content.includes('child') ||
    content.includes('pediatric') ||
    content.includes('baby') ||
    content.includes('infant')
  )
    return 'Pediatrics';

  // Mental Health
  if (
    content.includes('depression') ||
    content.includes('anxiety') ||
    content.includes('mental health') ||
    content.includes('psychiatry')
  )
    return 'Mental Health';

  // Gastroenterology
  if (
    content.includes('stomach') ||
    content.includes('digestive') ||
    content.includes('gastro') ||
    content.includes('colonoscopy')
  )
    return 'Gastroenterology';

  return 'Primary Care';
}

function categorizeChiefConcern(transcription?: string): string {
  const content = transcription?.toLowerCase() || '';

  if (
    content.includes('pain') ||
    content.includes('hurt') ||
    content.includes('ache')
  ) {
    return 'Pain Management - Location and severity assessment needed';
  }

  if (
    content.includes('fever') ||
    content.includes('temperature') ||
    content.includes('chills')
  ) {
    return 'Infection/Fever - Temperature monitoring required';
  }

  if (
    content.includes('shortness of breath') ||
    content.includes('breathing') ||
    content.includes('chest pain')
  ) {
    return 'Respiratory/Cardiac - Priority assessment needed';
  }

  if (
    content.includes('injury') ||
    content.includes('accident') ||
    content.includes('fall')
  ) {
    return 'Injury/Trauma - Mechanism and severity assessment';
  }

  if (
    content.includes('medication') ||
    content.includes('prescription') ||
    content.includes('refill')
  ) {
    return 'Medication Management - Provider review required';
  }

  if (
    content.includes('test result') ||
    content.includes('lab') ||
    content.includes('x-ray')
  ) {
    return 'Results Follow-up - Provider interpretation needed';
  }

  return 'General Medical Concern - Clinical assessment needed';
}

function extractInsuranceInfo(transcription?: string): string {
  const content = transcription?.toLowerCase() || '';

  if (content.includes('medicare'))
    return 'Medicare - Verify eligibility and coverage';
  if (content.includes('medicaid'))
    return 'Medicaid - Check current authorization status';
  if (content.includes('blue cross') || content.includes('bcbs'))
    return 'Blue Cross Blue Shield - Verify benefits';
  if (content.includes('aetna')) return 'Aetna - Check network and coverage';
  if (content.includes('cigna'))
    return 'Cigna - Verify benefits and authorizations';
  if (content.includes('united healthcare') || content.includes('uhc'))
    return 'United Healthcare - Check coverage';
  if (
    content.includes('no insurance') ||
    content.includes('self pay') ||
    content.includes('cash pay')
  )
    return 'Self-Pay - Discuss payment options';

  return 'Insurance verification needed - Check coverage and benefits';
}

function determineAppointmentDuration(
  events: any[],
  transcription?: string
): string {
  const content = transcription?.toLowerCase() || '';

  if (content.includes('new patient') || content.includes('first visit'))
    return '45-60 minutes (New Patient)';
  if (content.includes('physical') || content.includes('annual'))
    return '30-45 minutes (Comprehensive)';
  if (content.includes('procedure') || content.includes('biopsy'))
    return '30-60 minutes (Procedure)';
  if (content.includes('urgent') || content.includes('problem'))
    return '15-30 minutes (Problem-focused)';
  if (content.includes('follow up') || content.includes('recheck'))
    return '15-20 minutes (Follow-up)';

  return '15-30 minutes (Standard)';
}

function getMedicalTip(events: any[]): string {
  const tips = [
    'Verify patient identity with DOB and address before discussing medical information',
    'Document chief complaint and symptom duration for clinical assessment',
    'Check insurance coverage and prior authorizations before scheduling procedures',
    'Triage urgent symptoms appropriately - when in doubt, err on side of caution',
    'Maintain HIPAA compliance in all patient communications and record keeping',
  ];

  return tips[Math.floor(Math.random() * tips.length)];
}

// Medical-specific styles
const hipaaNoticeSection = {
  backgroundColor: '#fef3c7',
  border: '3px solid #f59e0b',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const hipaaTitle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#92400e',
  margin: '0 0 12px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const hipaaText = {
  fontSize: '14px',
  color: '#78350f',
  margin: '0 0 12px 0',
  lineHeight: '1.5',
  fontWeight: '500',
};

const hipaaDisclaimer = {
  fontSize: '13px',
  color: '#92400e',
  margin: '0',
  fontWeight: '600',
  fontStyle: 'italic',
};

const emergencyMedicalSection = {
  backgroundColor: '#fef2f2',
  border: '3px solid #dc2626',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const emergencyMedicalTitle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#dc2626',
  margin: '0 0 12px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const emergencyMedicalText = {
  fontSize: '14px',
  color: '#7f1d1d',
  margin: '0 0 16px 0',
  lineHeight: '1.5',
};

const emergencyActions = {
  marginTop: '16px',
};

const emergencyResponseButton = {
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

const urgentCareSection = {
  backgroundColor: '#fef0cd',
  border: '2px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px',
  textAlign: 'center' as const,
};

const urgentCareTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#92400e',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const urgentCareText = {
  fontSize: '13px',
  color: '#78350f',
  margin: '0',
  lineHeight: '1.4',
};

const careClassificationSection = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const classificationTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#0c4a6e',
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

const appointmentSection = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const appointmentTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#15803d',
  margin: '0 0 16px 0',
};

const appointmentLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#1f2937',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 6px 0',
};

const appointmentText = {
  fontSize: '13px',
  color: '#374151',
  margin: '0 0 12px 0',
  lineHeight: '1.4',
};

const medicalTip = {
  fontSize: '13px',
  color: '#15803d',
  fontWeight: '500',
  fontStyle: 'italic',
  textAlign: 'center' as const,
  margin: '16px 0 0 0',
  padding: '12px',
  backgroundColor: '#dcfce7',
  borderRadius: '4px',
};

const careToolsSection = {
  backgroundColor: '#f9fafb',
  border: '1px solid #f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const careToolsTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#374151',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const careButton = {
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

const intakeButton = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
};

const insuranceButton = {
  backgroundColor: '#059669',
  color: '#ffffff',
};

const schedulerButton = {
  backgroundColor: '#dc2626',
  color: '#ffffff',
};

const formsButton = {
  backgroundColor: '#7c3aed',
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

const bestPracticesSection = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px',
};

const bestPracticesTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#166534',
  margin: '0 0 10px 0',
};

const bestPracticesList = {
  fontSize: '13px',
  color: '#166534',
  margin: '0',
  lineHeight: '1.6',
};

const safetySection = {
  backgroundColor: '#fefbf2',
  border: '1px solid #fed7aa',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px',
};

const safetyTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#c2410c',
  margin: '0 0 10px 0',
};

const safetyText = {
  fontSize: '12px',
  color: '#c2410c',
  margin: '0',
  lineHeight: '1.5',
};
