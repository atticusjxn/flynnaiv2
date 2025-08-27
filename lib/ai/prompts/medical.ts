// Medical/Healthcare Industry-Specific AI Prompts for Flynn.ai v2

import { buildSystemPrompt } from './base';

export const MEDICAL_INDUSTRY_CONTEXT = `
INDUSTRY: Healthcare & Medical Services  
TARGET: Medical practices, clinics, specialists, healthcare providers

INDUSTRY-SPECIFIC FOCUS AREAS:
1. APPOINTMENT TYPES: New patients, follow-ups, procedures, consultations
2. SYMPTOM URGENCY: Emergency vs routine care needs
3. INSURANCE VERIFICATION: Coverage requirements, authorization needs
4. PATIENT DEMOGRAPHICS: Age, existing conditions affecting scheduling
5. PROVIDER AVAILABILITY: Specialist scheduling, procedure requirements
6. HIPAA COMPLIANCE: Patient privacy and information handling

MEDICAL SERVICES URGENCY CLASSIFICATION:
- EMERGENCY (Direct to ER/Immediate):
  * "chest pain", "heart attack", "stroke symptoms"
  * "severe bleeding", "major injury", "unconscious"
  * "difficulty breathing", "can't breathe"
  * "severe allergic reaction", "anaphylaxis"
  * "overdose", "poisoning", "suicide attempt"
  * "severe abdominal pain", "appendicitis symptoms"

- HIGH (Same day/urgent care):
  * "high fever", "severe pain", "infection signs"
  * "injury needs stitches", "possible fracture"
  * "eye injury", "vision problems", "eye pain"
  * "severe headache", "migraine", "head injury"
  * "pregnancy complications", "miscarriage concerns"
  * "medication reaction", "side effects"

- MEDIUM (Within 2-7 days):
  * "new symptoms", "worsening condition"
  * "follow-up needed", "test results discussion"
  * "medication adjustment", "prescription refill"
  * "routine check-up overdue", "physical exam"
  * "specialist referral", "second opinion"
  * "minor injury", "persistent symptoms"

- LOW (Routine scheduling 1-4 weeks):
  * "annual physical", "wellness visit", "screening"
  * "routine follow-up", "stable condition check"
  * "preventive care", "vaccinations", "health maintenance"
  * "cosmetic consultation", "elective procedure"
  * "chronic condition management" (stable)

MEDICAL TERMINOLOGY TRANSLATIONS:
- "see the doctor" / "doctor visit" = appointment
- "check-up" / "physical" = wellness visit
- "follow-up" / "recheck" = follow-up appointment
- "specialist" / "referral" = specialist consultation
- "procedure" / "surgery" / "operation" = procedure appointment
- "urgent" / "can't wait" / "emergency" = urgent care

COMMON APPOINTMENT TYPES:
- New Patient Visit (comprehensive intake)
- Follow-up Visit (existing condition monitoring)
- Annual Physical (preventive wellness)
- Specialist Consultation (referral-based)
- Procedure/Minor Surgery (scheduled intervention)
- Urgent Care Visit (same-day need)
- Telehealth Visit (remote consultation)
- Lab/Diagnostic Tests (bloodwork, imaging)

PATIENT DEMOGRAPHICS FACTORS:
PEDIATRIC (Under 18):
- Parent/guardian must schedule
- School schedule considerations
- Vaccination requirements
- Growth/development monitoring

ADULT (18-64):
- Work schedule flexibility needed
- Insurance authorization requirements
- Chronic condition management
- Preventive care compliance

GERIATRIC (65+):
- Multiple conditions common
- Medication management complex  
- Transportation considerations
- Medicare/insurance complexity

SCHEDULING CONSIDERATIONS:
1. PATIENT INFO: Name, DOB, insurance, contact preferences
2. VISIT TYPE: New patient, follow-up, procedure, urgent
3. SYMPTOMS/REASON: Chief complaint, urgency assessment
4. PROVIDER PREFERENCE: Specific doctor, specialist type
5. TIMING: Availability, urgency level, work/school schedule
6. INSURANCE: Coverage verification, authorization needs

HIPAA COMPLIANCE REQUIREMENTS:
- Patient privacy must be protected
- Limited information sharing
- Secure communication preferences
- Authorization for family involvement
- Minimum necessary information rule
- Patient rights acknowledgment

INSURANCE CONSIDERATIONS:
- Prior authorization requirements
- Referral needs for specialists
- Coverage verification timing
- Copay/deductible information
- Network provider requirements
- Claims processing timeline

SYMPTOM ASSESSMENT GUIDELINES:
EMERGENCY SYMPTOMS:
- Life-threatening conditions
- Severe pain (8-10/10 scale)
- Breathing difficulties
- Chest pain, stroke signs
- Severe bleeding, trauma

URGENT SYMPTOMS:
- High fever, severe infection signs
- Moderate to severe pain (6-8/10)
- Concerning new symptoms
- Worsening existing conditions
- Medication issues

ROUTINE SYMPTOMS:
- Mild symptoms, stable conditions
- Preventive care needs
- Chronic condition management
- Follow-up appointments
- Wellness visits

COMMUNICATION PATTERNS:
- Patients may downplay symptoms
- Anxiety about medical costs
- Confusion about insurance coverage
- Multiple symptoms mentioned
- Family member may be calling
- Language barriers possible
- Health literacy variations
`;

export function buildMedicalPrompt(context?: { practiceType?: string; userLocation?: string; businessHours?: string }): string {
  const basePrompt = buildSystemPrompt('medical');
  
  return `${basePrompt}

${MEDICAL_INDUSTRY_CONTEXT}

EXTRACTION FOCUS FOR MEDICAL CALLS:
1. LISTEN FOR: Symptoms, appointment types, urgency indicators, patient demographics
2. PRIORITIZE: Symptom urgency, appointment type, insurance requirements
3. IDENTIFY: Emergency situations requiring immediate medical attention
4. CAPTURE: Patient information, symptoms, preferred timing, insurance details
5. NOTE: HIPAA considerations, family involvement, special needs

MEDICAL SERVICES SUCCESS METRICS:
- Urgency classification accuracy: Target 98%+ (critical for patient safety)
- Appointment type identification: Target 95%+
- Patient demographics capture: Target 90%+
- Insurance information: Target 85%+
- Symptom documentation: Target 90%+

${context?.practiceType ? `PRACTICE TYPE: This is a ${context.practiceType} practice` : ''}
${context?.userLocation ? `LOCATION: Practice located in ${context.userLocation}` : ''}
${context?.businessHours ? `HOURS: Office hours are ${context.businessHours}` : ''}

CRITICAL SAFETY NOTE: Any symptoms suggesting emergency conditions (chest pain, breathing difficulty, severe bleeding, stroke signs) should be classified as EMERGENCY with recommendation for immediate ER care, not office scheduling.

REMEMBER: Patient safety is paramount. When in doubt about symptom urgency, err on the side of higher priority. HIPAA compliance requires careful handling of patient information. Emergency symptoms require immediate medical attention, not appointment scheduling.`;
}

export const MEDICAL_VALIDATION_RULES = {
  requiredFields: ['title', 'description', 'urgency'],
  highValueFields: ['customer_name', 'customer_phone', 'proposed_datetime', 'notes'],
  emergencyKeywords: [
    'chest pain', 'heart attack', 'stroke', 'bleeding', 'breathing',
    'unconscious', 'overdose', 'allergic reaction', 'severe pain'
  ],
  appointmentKeywords: [
    'appointment', 'visit', 'check-up', 'physical', 'follow-up',
    'consultation', 'procedure', 'urgent care', 'specialist'
  ],
  hipaaRequired: true,
  patientSafetyPriority: true,
  averageAppointmentDuration: 30, // minutes
  defaultBusinessHours: '08:00-17:00 Mon-Fri',
  emergencyRedirect: 'Emergency situations should direct to ER, not office scheduling'
};