// Plumbing/HVAC Industry-Specific AI Prompts for Flynn.ai v2

import { buildSystemPrompt } from './base';

export const PLUMBING_INDUSTRY_CONTEXT = `
INDUSTRY: Plumbing, HVAC & Home Services
TARGET: Service contractors, plumbers, HVAC technicians, home repair professionals

INDUSTRY-SPECIFIC FOCUS AREAS:
1. SERVICE ADDRESSES: Critical for field work - must capture complete or partial addresses
2. PROBLEM DESCRIPTIONS: Specific issues help with preparation and parts planning
3. EMERGENCY DETECTION: Water damage, no heat/AC, flooding require immediate response  
4. TIME AVAILABILITY: Customer schedule preferences (morning, afternoon, evening)
5. PRICE DISCUSSIONS: Estimates, service call fees, parts costs
6. ACCESS REQUIREMENTS: Keys, gate codes, special entry instructions

PLUMBING-SPECIFIC URGENCY CLASSIFICATION:
- EMERGENCY (Immediate response < 2 hours):
  * "flooding", "burst pipe", "water everywhere"
  * "no water", "no heat", "no hot water" (in winter)
  * "sewage backup", "toilet overflowing"
  * "gas leak", "smell gas"
  * "water heater leaking", "basement flooding"

- HIGH (Same day service):
  * "water damage", "leak getting worse"
  * "no hot water" (mild weather)
  * "drain completely blocked"
  * "toilet won't flush", "can't use bathroom"
  * "boiler issues", "furnace problems"

- MEDIUM (Next 1-3 days):
  * "slow drain", "minor leak"
  * "running toilet", "dripping faucet" 
  * "water pressure issues"
  * "routine maintenance", "tune-up"
  * "install new fixture"

- LOW (Scheduled at convenience):
  * "upgrade", "remodel planning"
  * "inspection", "annual maintenance"
  * "quote for future work"
  * "non-urgent improvements"

PLUMBING TERMINOLOGY TRANSLATIONS:
- "come out" / "come by" / "come take a look" = service_call
- "give me a price" / "how much" / "estimate" = quote  
- "fix" / "repair" / "look at" = service_call
- "install" / "replace" / "put in new" = service_call
- "emergency" / "urgent" / "ASAP" = emergency
- "when you can" / "no rush" = low urgency

COMMON SERVICE TYPES:
- Leak repair (faucet, pipe, toilet, shower)
- Drain cleaning (sink, tub, main line)
- Water heater (repair, replace, install)
- Toilet issues (running, clogged, replace)
- Installation (fixtures, appliances, pipes)
- HVAC (furnace, AC, ductwork, maintenance)
- Emergency plumbing (burst pipe, flooding)
- Inspection (camera, diagnostic, estimate)

CRITICAL INFORMATION REQUIREMENTS:
1. SERVICE ADDRESS: Required for dispatch - capture street name at minimum
2. CONTACT INFO: Name and phone number essential for scheduling
3. PROBLEM TYPE: Specific issue helps with parts and time estimation
4. URGENCY LEVEL: Determines scheduling priority
5. ACCESS INFO: How to enter property, best contact method
6. TIME PREFERENCES: Morning/afternoon preference, availability

PRICE EXPECTATION PATTERNS:
- "How much do you charge?" = quote request
- "What's your service call fee?" = standard pricing inquiry  
- "Is it expensive to..." = cost concern, needs estimate
- "Ball park figure" = rough estimate request
- "Free estimate?" = quote service type

CUSTOMER COMMUNICATION STYLE:
- Often stressed during emergencies
- May not use technical terms
- Location descriptions may be imprecise
- Emergency calls may be from tenants, not property owners
- Price sensitivity varies by urgency level

SPECIAL CONSIDERATIONS:
- Emergency calls override normal scheduling
- Service address absolutely critical for field work
- Multiple problems may be mentioned in one call
- Seasonal variations (heating in winter, AC in summer)
- Property type affects service complexity (house vs apartment vs commercial)
`;

export function buildPlumbingPrompt(context?: {
  userLocation?: string;
  businessHours?: string;
}): string {
  const basePrompt = buildSystemPrompt('plumbing');

  return `${basePrompt}

${PLUMBING_INDUSTRY_CONTEXT}

EXTRACTION FOCUS FOR PLUMBING CALLS:
1. LISTEN FOR: Water problems, heating/cooling issues, fixture problems, installations
2. PRIORITIZE: Service address, customer contact, problem urgency
3. IDENTIFY: Emergency situations that need immediate response
4. CAPTURE: Specific problem details that help with preparation
5. NOTE: Access instructions, property type, special circumstances

PLUMBING SUCCESS METRICS:
- Service address captured: Target 95%+ 
- Emergency detection: Target 98%+ accuracy
- Problem type identification: Target 90%+
- Customer contact info: Target 90%+
- Urgency classification: Target 95%+

${context?.businessHours ? `BUSINESS CONTEXT: Business hours are ${context.businessHours}` : ''}
${context?.userLocation ? `SERVICE AREA: Primary service area is ${context.userLocation}` : ''}

REMEMBER: Plumbing emergencies can cause significant property damage. When in doubt about urgency, err on the side of higher priority. Service address is CRITICAL - without it, no service call can be completed.`;
}

export const PLUMBING_VALIDATION_RULES = {
  requiredFields: ['title', 'description', 'urgency'],
  highValueFields: ['location', 'customer_name', 'customer_phone'],
  emergencyKeywords: [
    'flooding',
    'burst pipe',
    'no water',
    'sewage backup',
    'gas leak',
    'water everywhere',
    'basement flood',
    'toilet overflow',
  ],
  serviceKeywords: [
    'leak',
    'drain',
    'toilet',
    'faucet',
    'water heater',
    'pipe',
    'plumbing',
    'clogged',
    'running',
    'dripping',
    'install',
    'replace',
  ],
  locationRequired: true,
  averageCallDuration: 90, // minutes
  defaultBusinessHours: '08:00-17:00 Mon-Sat',
};
