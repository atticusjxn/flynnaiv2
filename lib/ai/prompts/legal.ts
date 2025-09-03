// Legal Services Industry-Specific AI Prompts for Flynn.ai v2

import { buildSystemPrompt } from './base';

export const LEGAL_INDUSTRY_CONTEXT = `
INDUSTRY: Legal Services & Law Firms
TARGET: Attorneys, paralegals, legal assistants, law firm staff

INDUSTRY-SPECIFIC FOCUS AREAS:
1. LEGAL MATTER TYPE: Case classification affects urgency and handling
2. CONSULTATION REQUESTS: Initial consultations, case evaluations
3. DEADLINE SENSITIVITY: Court dates, statute of limitations, filing deadlines
4. CONFIDENTIALITY: Attorney-client privilege, sensitive information handling
5. REFERRAL SOURCES: How clients found the firm affects priority
6. CONFLICT CHECKING: Potential conflicts of interest screening

LEGAL SERVICES URGENCY CLASSIFICATION:
- EMERGENCY (Immediate attention < 4 hours):
  * "court tomorrow", "hearing today", "statute runs out"
  * "arrest", "detained", "custody", "jail"
  * "restraining order", "protection order", "harassment"
  * "criminal charges", "police investigation"
  * "eviction notice", "foreclosure notice"
  * "immigration detention", "deportation"

- HIGH (Within 24-48 hours):
  * "court next week", "filing deadline approaching"
  * "divorce papers served", "lawsuit filed"
  * "accident yesterday", "injury case", "insurance deadline"
  * "contract dispute", "breach of contract"
  * "employment termination", "discrimination"
  * "estate planning urgent", "will needed soon"

- MEDIUM (Within 1 week):
  * "consultation needed", "case evaluation"
  * "contract review", "document preparation"
  * "business formation", "incorporation"
  * "real estate transaction", "closing preparation"
  * "family law matter", "custody arrangement"
  * "personal injury follow-up"

- LOW (Flexible scheduling):
  * "general consultation", "legal advice"
  * "planning ahead", "preventive legal"
  * "document templates", "form preparation"
  * "legal education", "understanding rights"
  * "routine business legal", "compliance"

LEGAL TERMINOLOGY TRANSLATIONS:
- "consult" / "consultation" / "legal advice" = consultation
- "case" / "matter" / "legal issue" = case evaluation
- "court" / "hearing" / "trial" = court representation
- "sue" / "lawsuit" / "legal action" = litigation
- "contract" / "agreement" / "deal" = contract law
- "will" / "estate" / "inheritance" = estate planning

LEGAL PRACTICE AREAS:
- Personal Injury (accidents, malpractice, liability)
- Family Law (divorce, custody, adoption, support)
- Criminal Defense (charges, investigation, trial)
- Business Law (formation, contracts, compliance)
- Real Estate (transactions, disputes, zoning)
- Estate Planning (wills, trusts, probate)
- Employment Law (wrongful termination, discrimination)
- Immigration (visas, citizenship, deportation)
- Bankruptcy (debt relief, Chapter 7/13)
- Civil Litigation (disputes, lawsuits, appeals)

URGENCY INDICATORS:
CRITICAL TIMING:
- Court dates and deadlines
- Statute of limitations expiration
- Government agency deadlines
- Contract expiration dates
- Criminal proceedings timeline

EMERGENCY SITUATIONS:
- Active criminal charges
- Restraining orders needed
- Immigration detention
- Imminent foreclosure/eviction
- Child custody emergencies

CONSULTATION TRIGGERS:
- "Need a lawyer" / "legal help"
- "What are my rights?"
- "Can I sue?" / "Do I have a case?"
- "Legal advice needed"
- "Attorney consultation"

CLIENT INTAKE REQUIREMENTS:
1. LEGAL MATTER TYPE: Area of law, specific issue
2. TIMELINE/DEADLINES: Court dates, statutory deadlines
3. OPPOSING PARTIES: Conflict checking requirements  
4. URGENCY LEVEL: Emergency vs routine consultation
5. CONTACT INFO: Secure communication preferences
6. REFERRAL SOURCE: How they found the firm
7. INITIAL ASSESSMENT: Basic facts and circumstances

CONFIDENTIALITY CONSIDERATIONS:
- Attorney-client privilege begins with consultation
- Sensitive information may be disclosed
- Conflict checking required for new matters
- Secure communication preferences important
- Privacy requirements may affect scheduling

LEGAL COMMUNICATION PATTERNS:
- Clients may be emotional or stressed
- Technical legal terms may be misused
- Multiple legal issues often mentioned
- Urgency may be over/understated due to emotion
- Previous legal experience varies widely
- Financial concerns about legal fees common

SPECIAL SCHEDULING CONSIDERATIONS:
- Court schedules affect attorney availability
- Depositions and hearings are immovable
- Client work schedules (especially employed clients)
- Emergency matters override normal scheduling
- Travel time to courts and meetings
- Document preparation deadlines
`;

export function buildLegalPrompt(context?: {
  practiceAreas?: string[];
  userLocation?: string;
  businessHours?: string;
}): string {
  const basePrompt = buildSystemPrompt('legal');

  return `${basePrompt}

${LEGAL_INDUSTRY_CONTEXT}

EXTRACTION FOCUS FOR LEGAL CALLS:
1. LISTEN FOR: Legal matter type, deadlines, court dates, urgency indicators
2. PRIORITIZE: Case type, timeline urgency, potential conflicts
3. IDENTIFY: Emergency legal situations requiring immediate attention
4. CAPTURE: Specific legal issues, deadline information, referral source
5. NOTE: Confidentiality requirements, opposing parties, emotional state

LEGAL SERVICES SUCCESS METRICS:
- Legal matter type identified: Target 90%+
- Urgency classification accuracy: Target 95%+
- Deadline capture: Target 85%+
- Conflict screening info: Target 80%+
- Contact information: Target 95%+

${context?.practiceAreas ? `PRACTICE AREAS: Firm specializes in ${context.practiceAreas.join(', ')}` : ''}
${context?.userLocation ? `JURISDICTION: Primary practice location is ${context.userLocation}` : ''}
${context?.businessHours ? `OFFICE HOURS: Available for consultations ${context.businessHours}` : ''}

REMEMBER: Legal matters often have strict deadlines that cannot be missed. When in doubt about urgency, err on the side of higher priority. Confidentiality is paramount - note if sensitive information is disclosed. Emergency legal situations require immediate attorney attention.`;
}

export const LEGAL_VALIDATION_RULES = {
  requiredFields: ['title', 'description', 'urgency'],
  highValueFields: [
    'customer_name',
    'customer_phone',
    'proposed_datetime',
    'notes',
  ],
  emergencyKeywords: [
    'court tomorrow',
    'statute',
    'deadline',
    'arrest',
    'detained',
    'hearing',
    'trial',
    'eviction',
    'foreclosure',
    'emergency',
  ],
  practiceAreaKeywords: [
    'divorce',
    'custody',
    'criminal',
    'accident',
    'injury',
    'contract',
    'business',
    'estate',
    'will',
    'lawsuit',
    'immigration',
    'bankruptcy',
  ],
  confidentialityRequired: true,
  averageConsultationDuration: 60, // minutes
  defaultBusinessHours: '09:00-17:00 Mon-Fri',
  conflictCheckingRequired: true,
};
