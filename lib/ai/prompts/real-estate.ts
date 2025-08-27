// Real Estate Industry-Specific AI Prompts for Flynn.ai v2

import { buildSystemPrompt } from './base';

export const REAL_ESTATE_INDUSTRY_CONTEXT = `
INDUSTRY: Real Estate Sales & Property Management
TARGET: Real estate agents, property managers, brokers, showing coordinators

INDUSTRY-SPECIFIC FOCUS AREAS:
1. PROPERTY ADDRESSES: Essential for showings - capture complete addresses when possible
2. SHOWING REQUESTS: Property tours, open houses, private showings
3. BUYER QUALIFICATION: Pre-approved, cash buyers, timeline urgency
4. LISTING INQUIRIES: New listings, price changes, market analysis
5. OFFER NEGOTIATIONS: Purchase offers, counteroffers, closing coordination
6. PROPERTY MANAGEMENT: Tenant issues, maintenance, inspections

REAL ESTATE URGENCY CLASSIFICATION:
- HIGH (Priority scheduling within 24 hours):
  * "pre-approved buyer", "cash buyer", "qualified buyer"
  * "closing soon", "need to close by [date]"
  * "relocating", "job transfer", "must move"
  * "backup offer", "multiple offers"
  * "just came on market", "new listing"
  * "price reduction", "motivated seller"

- MEDIUM (Schedule within 2-3 days):  
  * "serious buyer", "ready to make offer"
  * "specific timeline", "looking to buy soon"
  * "comparing properties", "narrowed down choices"
  * "investment property", "rental property"
  * "first-time buyer" (with financing)

- LOW (Flexible scheduling):
  * "just looking", "getting started"
  * "exploring the market", "seeing what's available"
  * "might be interested", "checking it out"
  * "no timeline", "when convenient"
  * "curious about value", "market research"

REAL ESTATE TERMINOLOGY TRANSLATIONS:
- "show" / "tour" / "see the property" = showing/meeting
- "walk through" / "look at" = inspection/showing
- "list my house" / "sell my home" = listing consultation
- "what's it worth" / "market value" = appraisal/CMA
- "make an offer" / "put in offer" = offer negotiation
- "close" / "closing date" = transaction coordination

COMMON APPOINTMENT TYPES:
- Property showing (individual/group)
- Listing consultation (seller meeting)
- Buyer consultation (needs assessment)
- Open house (public showing)
- Property inspection (buyer's inspection)
- Appraisal appointment (value assessment)
- Closing meeting (transaction completion)
- Market analysis (CMA presentation)

BUYER/SELLER INDICATORS:
BUYERS:
- "looking for", "want to buy", "house hunting"
- "pre-approved", "financing ready", "cash buyer"
- "moving to area", "relocating", "job transfer"
- "first-time buyer", "upgrading", "downsizing"

SELLERS:  
- "want to sell", "thinking of selling", "list my house"
- "what's my house worth", "market value"
- "moving", "relocating", "downsizing"
- "investment property", "rental income"

QUALIFICATION INDICATORS:
HIGH PRIORITY:
- Pre-approved financing
- Cash purchase capability  
- Specific timeline/deadline
- Job relocation requirement
- Already under contract (backup)

MEDIUM PRIORITY:
- Financing in process
- General timeline (3-6 months)
- Specific area/price range
- Comparing multiple properties

LOW PRIORITY:
- No financing discussion
- "Just looking" language
- No specific timeline
- General market curiosity

PROPERTY INFORMATION REQUIREMENTS:
1. PROPERTY ADDRESS: Critical for showings - street address minimum
2. PROPERTY TYPE: House, condo, townhome, commercial, land
3. PRICE RANGE: Budget parameters, financing status
4. TIMING: When to show, how soon to buy/sell
5. CONTACT INFO: Name, phone, email, preferred contact method
6. SPECIAL NEEDS: Accessibility, pets, specific requirements

MARKET CONDITIONS AWARENESS:
- Seller's market: Buyers have urgency, multiple offers common
- Buyer's market: More inventory, longer decision times
- Interest rate sensitivity affects buyer urgency
- Seasonal patterns (spring/summer busy, winter slower)
- Local market factors affect urgency levels

COMMUNICATION PATTERNS:
- Buyers often call about specific properties
- Sellers inquire about market value and process
- Urgency often hidden - probe for true timeline
- Multiple family members may be involved
- Financing affects real urgency vs stated urgency
`;

export function buildRealEstatePrompt(context?: { marketConditions?: string; userLocation?: string; businessHours?: string }): string {
  const basePrompt = buildSystemPrompt('real_estate');
  
  return `${basePrompt}

${REAL_ESTATE_INDUSTRY_CONTEXT}

EXTRACTION FOCUS FOR REAL ESTATE CALLS:
1. LISTEN FOR: Showing requests, buying/selling inquiries, property addresses
2. PRIORITIZE: Property location, buyer qualification, timeline urgency  
3. IDENTIFY: Pre-approved buyers, cash buyers, specific deadlines
4. CAPTURE: Property details, contact preferences, showing availability
5. NOTE: Family decision makers, financing status, special requirements

REAL ESTATE SUCCESS METRICS:
- Property address captured: Target 90%+
- Buyer qualification detected: Target 85%+
- Timeline urgency accuracy: Target 90%+
- Appointment type classification: Target 95%+
- Contact information: Target 90%+

${context?.marketConditions ? `MARKET CONDITIONS: Current market is ${context.marketConditions}` : ''}
${context?.userLocation ? `SERVICE AREA: Primary market area is ${context.userLocation}` : ''}
${context?.businessHours ? `BUSINESS HOURS: Available for showings ${context.businessHours}` : ''}

REMEMBER: Real estate is relationship-driven and timeline-sensitive. Qualified buyers with financing deserve priority scheduling. Property address is essential for showings. Timeline urgency may be understated - look for hidden urgency indicators.`;
}

export const REAL_ESTATE_VALIDATION_RULES = {
  requiredFields: ['title', 'description', 'urgency'],
  highValueFields: ['location', 'customer_name', 'customer_phone', 'proposed_datetime'],
  buyerQualificationKeywords: [
    'pre-approved', 'cash buyer', 'financing ready', 'qualified buyer',
    'closing soon', 'relocating', 'job transfer', 'must move'
  ],
  showingKeywords: [
    'show', 'tour', 'see property', 'walk through', 'look at',
    'open house', 'private showing', 'visit property'
  ],
  propertyRequired: true,
  averageAppointmentDuration: 45, // minutes
  defaultBusinessHours: '09:00-18:00 Mon-Sun',
  qualificationImportance: 'high'
};