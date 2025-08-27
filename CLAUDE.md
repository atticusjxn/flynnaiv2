# Flynn.ai v2 - Claude Code Agent Knowledge Base

## 🎯 Project Overview

### Vision Statement
Flynn.ai v2 is a universal AI-powered platform that transforms business phone calls into organized calendar events. We're building the future of call-to-calendar automation for 15+ million professionals across all industries.

### Strategic Mission
**"Turn every business call into actionable calendar events within 2 minutes"**

Replace manual scheduling friction with intelligent automation that adapts to any industry - from plumbers handling emergencies to real estate agents scheduling showings to lawyers managing consultations.

### Core Value Proposition
- **Silent Keypad Activation**: Press *7 during any call for invisible AI processing
- **Universal Industry Support**: One platform adapts to all business types
- **AI-Powered Intelligence**: Extract events, not just transcripts
- **Complete Workflow**: Call → AI Processing → Email → Calendar → Management
- **Professional Grade**: Enterprise-ready with security and compliance
- **Mobile-First**: Built for professionals who live on their phones

### Business Model
**Tiered SaaS Pricing:**
- **Basic ($29/month)**: AI Call Notes with email delivery
- **Professional ($79/month)**: Advanced calendar/CRM integrations  
- **Enterprise ($149/month)**: Full job management with native app

**Target Market Size**: 15M+ professionals across industries
**Revenue Potential**: $500M+ ARR at 5% market penetration

## 🏗️ Technical Architecture

### Technology Stack
```typescript
// Frontend & Backend
Framework: Next.js 14 with App Router
Language: TypeScript (strict mode)
Styling: Tailwind CSS
Authentication: Supabase Auth

// Database & Real-time
Database: Supabase (PostgreSQL)
Real-time: Supabase Realtime
Caching: Redis (production)

// AI & Voice Processing
AI: OpenAI GPT-4 + Whisper
Voice: Twilio Voice API + Media Streams + DTMF Detection
Transcription: Real-time with confidence scoring
Keypad Processing: Silent *7 activation with real-time audio streaming

// Communication
Email: React Email + Resend
Calendar: Google Calendar API, Microsoft Graph, ICS
SMS: Twilio Messaging API

// Infrastructure
Hosting: Vercel (recommended)
CDN: Vercel Edge Network
Monitoring: Sentry + PostHog
Payments: Stripe
```

### System Architecture
```
[Incoming Call] → [DTMF Detection] → [*7 Pressed?] → [Silent AI Activation]
       ↓                    ↓                    ↓
[Continue Normal Call] → [Real-time Audio Stream] → [Live Transcription]
       ↓                    ↓                    ↓
[Call Continues] → [AI Event Extraction] → [Database Storage]
       ↓                    ↓                    ↓
[Call Ends] → [Email Generation] → [Dashboard Update]
       ↓                    ↓                    ↓
[Caller Unaware] → [Professional Email] → [Calendar Sync]
       ↓                    ↓                    ↓
[Business Continues] → [Event Management] → [User Management]
```

### Core Data Models
```typescript
// Primary Entities
User → Industry Configuration → Business Rules
Call → AI Processing → Event Extraction
Event → Status Management → Calendar Sync
Communication → Email/SMS → Customer Tracking

// Relationships
User (1:many) Calls
Call (1:many) Events  
Event (1:many) Communications
User (1:many) Calendar Integrations
Industry (1:many) Event Types
```

## 🎨 Industry-Adaptive Design

### Keypad-Activated Silent Processing
```typescript
interface KeypadActivatedFeatures {
  activation: {
    trigger: '*7 keypress during active call';
    user_feedback: 'None - completely silent activation';
    caller_awareness: 'Zero - no indication of AI processing';
    processing_mode: 'Real-time audio streaming and transcription';
  };
  
  silent_operation: {
    audio_processing: 'Background Whisper transcription';
    ai_extraction: 'Live GPT-4 event detection';
    user_experience: 'Continue conversation naturally';
    system_behavior: 'No sounds, vibrations, or visual indicators';
  };
  
  post_call_delivery: {
    timeline: 'Within 2 minutes of call end';
    deliverables: ['Professional email summary', 'Structured appointment details', '.ics calendar file'];
    accuracy: '90%+ event extraction from live audio';
    industries: 'Optimized for service businesses';
  };
  
  technical_implementation: {
    dtmf_detection: 'Real-time keypad monitoring via Twilio';
    audio_streaming: 'Media Streams API for live processing';
    transcription: 'Streaming Whisper API integration';
    ai_processing: 'Real-time GPT-4 event extraction';
    email_generation: 'Automated professional communication';
  };
}
```

### Supported Industries & Event Types
```typescript
interface IndustryMatrix {
  plumbing: {
    events: ['service_call', 'emergency', 'quote', 'follow_up'];
    terminology: { appointment: 'service call', customer: 'customer' };
    urgency: ['emergency', 'high', 'medium', 'low'];
    defaultDuration: 90; // minutes
    businessHours: '08:00-17:00 Mon-Sat';
  };
  
  real_estate: {
    events: ['showing', 'meeting', 'inspection', 'closing'];
    terminology: { service_call: 'property showing', customer: 'client' };
    urgency: ['high', 'medium', 'low']; // no emergency
    defaultDuration: 45;
    businessHours: '09:00-18:00 Mon-Sun';
  };
  
  legal: {
    events: ['consultation', 'meeting', 'court', 'deposition'];
    terminology: { service_call: 'consultation', customer: 'client' };
    urgency: ['emergency', 'high', 'medium', 'low'];
    defaultDuration: 60;
    businessHours: '09:00-17:00 Mon-Fri';
  };
  
  medical: {
    events: ['appointment', 'consultation', 'follow_up', 'urgent'];
    terminology: { customer: 'patient', service_call: 'appointment' };
    urgency: ['emergency', 'high', 'medium', 'low'];
    defaultDuration: 30;
    businessHours: '08:00-17:00 Mon-Fri';
    compliance: 'HIPAA';
  };
  
  sales: {
    events: ['demo', 'discovery', 'follow_up', 'proposal'];
    terminology: { customer: 'prospect', service_call: 'sales call' };
    urgency: ['high', 'medium', 'low'];
    defaultDuration: 45;
    businessHours: '09:00-17:00 Mon-Fri';
  };
  
  consulting: {
    events: ['consultation', 'strategy_session', 'workshop', 'check_in'];
    terminology: { service_call: 'consultation', customer: 'client' };
    urgency: ['high', 'medium', 'low'];
    defaultDuration: 90;
    businessHours: '09:00-17:00 Mon-Fri';
  };
}
```

### AI Extraction Logic
```typescript
interface ExtractionRules {
  // Universal Detection
  emergency_keywords: ['emergency', 'urgent', 'asap', 'right now'];
  time_patterns: ['tomorrow', 'next week', '2 PM', 'morning', 'afternoon'];
  location_patterns: ['at', 'address', 'street', 'avenue', 'drive'];
  
  // Industry-Specific Classification
  industry_classification: {
    plumbing: {
      service_indicators: ['fix', 'repair', 'install', 'leak', 'clogged'];
      emergency_triggers: ['flooding', 'burst pipe', 'no water', 'sewage'];
      location_critical: true;
      pricing_expected: true;
    };
    
    real_estate: {
      service_indicators: ['show', 'see property', 'tour', 'list'];
      urgency_triggers: ['pre-approved', 'cash buyer', 'closing soon'];
      location_critical: true; // property addresses
      pricing_expected: false; // handled differently
    };
  };
  
  // Confidence Scoring
  confidence_factors: {
    explicit_time: 0.9; // "tomorrow at 2 PM"
    vague_time: 0.6; // "sometime this week"
    full_address: 0.95;
    partial_address: 0.7;
    complete_customer_info: 0.9;
    partial_customer_info: 0.7;
  };
}
```

## 💻 Development Standards

### Code Organization
```
flynnv2/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Auth routes - login, register, logout
│   │   ├── login/         # Login page with Supabase Auth
│   │   ├── register/      # Registration with industry selection
│   │   └── logout/        # Logout handling
│   ├── (dashboard)/       # Protected dashboard routes  
│   │   ├── dashboard/     # Main dashboard - call overview
│   │   ├── calls/         # Call history and management
│   │   │   └── [id]/      # Individual call details
│   │   ├── events/        # Event management interface
│   │   │   └── [id]/      # Event editing and details
│   │   ├── calendar/      # Calendar integration settings
│   │   ├── settings/      # User preferences and config
│   │   └── billing/       # Subscription management
│   ├── api/               # API Routes
│   │   ├── webhooks/      # External webhooks
│   │   │   ├── twilio/    # Twilio voice webhooks
│   │   │   │   ├── voice/ # Incoming call handling
│   │   │   │   ├── dtmf/  # Keypad press detection
│   │   │   │   ├── media-stream/ # Real-time audio processing
│   │   │   │   ├── recording/ # Recording completion
│   │   │   │   └── transcription/ # Transcription ready
│   │   │   └── stripe/    # Stripe billing webhooks
│   │   ├── calls/         # Call management endpoints
│   │   ├── events/        # Event CRUD operations
│   │   ├── ai/            # AI processing endpoints
│   │   │   ├── extract/   # Event extraction
│   │   │   └── classify/  # Industry classification
│   │   ├── emails/        # Email sending and templates
│   │   ├── calendar/      # Calendar integration
│   │   │   ├── google/    # Google Calendar OAuth & sync
│   │   │   ├── outlook/   # Outlook integration
│   │   │   └── ics/       # ICS file generation
│   │   └── user/          # User management
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Landing page
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   │   ├── button.tsx    # Button variants
│   │   ├── input.tsx     # Form inputs
│   │   ├── card.tsx      # Card layouts
│   │   └── ...           # Other UI primitives
│   ├── dashboard/        # Dashboard-specific components
│   │   ├── CallsList.tsx # Paginated calls list
│   │   ├── EventCard.tsx # Event display and quick actions
│   │   ├── StatusBadge.tsx # Status indicators
│   │   └── QuickActions.tsx # Bulk operations
│   ├── email-templates/  # React Email components
│   │   ├── BaseEmailLayout.tsx # Shared email layout
│   │   ├── CallOverviewEmail.tsx # Main email template
│   │   ├── EventCard.tsx # Email event cards
│   │   └── industry/     # Industry-specific templates
│   ├── calendar/         # Calendar integration UI
│   │   ├── CalendarSync.tsx # Sync status and controls
│   │   ├── ConflictResolver.tsx # Handle calendar conflicts
│   │   └── IntegrationCard.tsx # Provider connection UI
│   ├── industry/         # Industry-specific components
│   │   ├── IndustrySelector.tsx # Onboarding industry choice
│   │   ├── EventTypeSelector.tsx # Event type picker
│   │   └── TerminologyDisplay.tsx # Show industry terms
│   └── forms/            # Form components
│       ├── EventEditForm.tsx # Event editing interface
│       ├── UserSettings.tsx # Settings management
│       └── validation.ts # Zod schemas
├── lib/                  # Core business logic
│   ├── ai/               # AI processing logic
│   │   ├── AIExtractionPipeline.ts # Main AI orchestrator
│   │   ├── RealTimeProcessor.ts # Live audio processing
│   │   ├── KeypadActivation.ts # Silent *7 activation handling
│   │   ├── prompts/      # Industry-specific prompts
│   │   │   ├── base.ts   # Universal prompts
│   │   │   ├── plumbing.ts # Plumbing-specific
│   │   │   ├── real-estate.ts # Real estate prompts
│   │   │   └── ...       # Other industries
│   │   ├── classification.ts # Event type classification
│   │   ├── confidence.ts # Confidence scoring
│   │   └── validation.ts # AI output validation
│   ├── calendar/         # Calendar integrations
│   │   ├── CalendarService.ts # Universal calendar interface
│   │   ├── providers/    # Provider implementations
│   │   │   ├── GoogleCalendarProvider.ts
│   │   │   ├── OutlookCalendarProvider.ts
│   │   │   └── AppleCalendarProvider.ts
│   │   ├── icsGenerator.ts # ICS file creation
│   │   ├── conflictDetection.ts # Calendar conflicts
│   │   └── webhookHandler.ts # Calendar change webhooks
│   ├── email/            # Email system
│   │   ├── EmailService.ts # Email sending orchestrator
│   │   ├── templateRenderer.ts # Dynamic template rendering
│   │   ├── attachments.ts # ICS and file attachments
│   │   └── tracking.ts   # Email analytics
│   ├── industry/         # Industry configurations
│   │   ├── IndustryConfigurationManager.ts
│   │   ├── configurations.ts # All industry configs
│   │   ├── UserConfiguration.ts # User customizations
│   │   └── migration.ts  # Config version migrations
│   ├── twilio/           # Twilio integrations
│   │   ├── webhookHandler.ts # Webhook processing
│   │   ├── callManager.ts # Call lifecycle management
│   │   ├── dtmfHandler.ts # Keypad press detection
│   │   ├── mediaStreamHandler.ts # Real-time audio streaming
│   │   └── twimlGenerator.ts # TwiML response generation
│   └── supabase/         # Database operations
│       ├── calls.ts      # Call CRUD operations
│       ├── events.ts     # Event management
│       ├── users.ts      # User operations
│       ├── analytics.ts  # Usage analytics
│       └── migrations/   # Database migrations
├── utils/                # Utility functions
│   ├── supabase/         # Supabase client setup
│   │   ├── client.ts     # Client-side Supabase
│   │   ├── server.ts     # Server-side Supabase
│   │   └── middleware.ts # Auth middleware
│   ├── validation.ts     # Zod validation schemas
│   ├── date.ts           # Date/time utilities
│   ├── formatting.ts     # String and number formatting
│   └── constants.ts      # App constants
├── types/                # TypeScript type definitions
│   ├── database.types.ts # Generated Supabase types
│   ├── industry.ts       # Industry configuration types
│   ├── ai.types.ts       # AI processing types
│   ├── calendar.types.ts # Calendar integration types
│   └── email.types.ts    # Email system types
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication state
│   ├── useRealtime.ts    # Supabase realtime
│   ├── useIndustry.ts    # Industry configuration
│   ├── useEvents.ts      # Event management
│   └── useCalendar.ts    # Calendar operations
├── middleware.ts         # Next.js middleware for auth
├── tailwind.config.js    # Tailwind configuration
├── next.config.js        # Next.js configuration
└── package.json          # Dependencies and scripts
```

### Coding Conventions
```typescript
// File Naming
// Components: PascalCase (UserProfile.tsx)
// Utilities: camelCase (dateUtils.ts)
// Pages: lowercase (dashboard/page.tsx)
// Types: PascalCase with .types.ts suffix

// Component Structure
export interface ComponentProps {
  // Props interface first
}

export default function ComponentName({ ...props }: ComponentProps) {
  // Hooks at top
  // State management
  // Event handlers
  // Render logic
  
  return (
    // JSX with proper TypeScript types
  );
}

// API Route Structure
export async function GET(request: NextRequest) {
  try {
    // Input validation with Zod
    // Business logic
    // Database operations
    // Response formatting
    return NextResponse.json(data);
  } catch (error) {
    // Proper error handling
    return NextResponse.json({ error }, { status: 500 });
  }
}

// Database Operations
export async function createEvent(eventData: CreateEventInput) {
  // Input validation
  const validatedData = CreateEventSchema.parse(eventData);
  
  // Business logic
  const processedEvent = await processEventData(validatedData);
  
  // Database operation with error handling
  const { data, error } = await supabase
    .from('events')
    .insert(processedEvent)
    .select()
    .single();
    
  if (error) throw new DatabaseError(error.message);
  return data;
}
```

### Testing Standards
```typescript
// Test File Structure
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup code
  });
  
  describe('Feature Group', () => {
    it('should do specific behavior', async () => {
      // Arrange
      const input = createTestData();
      
      // Act
      const result = await functionUnderTest(input);
      
      // Assert
      expect(result).toEqual(expectedOutput);
    });
  });
});

// Coverage Requirements
// Unit Tests: 90%+ for lib/ directory
// Integration Tests: All API routes
// E2E Tests: Critical user flows
// Industry Tests: Each industry workflow
```

## 🤖 AI Processing Pipeline

### Event Extraction Workflow
```typescript
interface ProcessingPipeline {
  1. CallReceived: {
    trigger: 'Twilio webhook';
    action: 'Monitor for DTMF *7';
    next: 'DTMFDetection';
  };
  
  1a. DTMFDetection: {
    trigger: '*7 keypress detected';
    action: 'Activate silent AI processing';
    next: 'RealTimeTranscription';
  };
  
  1b. RealTimeTranscription: {
    trigger: 'Audio stream active';
    action: 'Begin live Whisper transcription';
    next: 'ContinuousProcessing';
  };
  
  2. ContinuousProcessing: {
    trigger: 'Real-time audio stream';
    action: 'Process audio chunks with AI';
    next: 'CallEndDetection';
  };
  
  3. CallEndDetection: {
    trigger: 'Call disconnection';
    action: 'Finalize AI extraction';
    next: 'EventExtraction';
  };
  
  2. RecordingComplete: {
    trigger: 'Recording webhook';
    action: 'Start transcription';
    next: 'TranscriptionReady';
  };
  
  3. TranscriptionReady: {
    trigger: 'Whisper completion';
    action: 'Begin AI extraction';
    next: 'EventExtraction';
  };
  
  4. EventExtraction: {
    process: [
      'Industry classification',
      'Event type detection',
      'Time/date extraction', 
      'Location identification',
      'Customer info parsing',
      'Urgency assessment'
    ];
    next: 'ValidationAndConfidence';
  };
  
  5. ValidationAndConfidence: {
    process: [
      'Confidence scoring',
      'Data validation',
      'Error detection',
      'Fallback handling'
    ];
    next: 'DatabaseStorage';
  };
  
  6. DatabaseStorage: {
    action: 'Store call and events';
    triggers: ['EmailGeneration', 'DashboardUpdate'];
  };
  
  7. EmailGeneration: {
    process: [
      'Template selection',
      'Industry adaptation',
      'Content generation',
      'ICS file creation'
    ];
    next: 'EmailDelivery';
  };
  
  8. EmailDelivery: {
    action: 'Send via Resend';
    success: 'NotifySuccess';
    failure: 'RetryOrAlert';
  };
}
```

### AI Prompt Engineering
```typescript
// Universal Base Prompt
const BASE_SYSTEM_PROMPT = `
You are Flynn.ai, an expert AI assistant specializing in analyzing business phone calls across various industries. Your task is to extract actionable events, appointments, and commitments from call transcriptions.

CORE RESPONSIBILITIES:
1. Extract ALL time-sensitive events mentioned in the call
2. Classify events appropriately for the business context  
3. Generate professional summaries for email communication
4. Assess urgency and follow-up requirements
5. Structure data for calendar integration

EXTRACTION GUIDELINES:
- Prioritize accuracy over quantity
- If information is unclear, mark confidence as low and flag for human review
- Always include confidence scores for uncertain extractions
- Extract multiple events per call when appropriate
- Maintain professional tone and appropriate industry terminology

OUTPUT FORMAT: Valid JSON only, no additional text.
`;

// Industry-Specific Enhancements
const INDUSTRY_PROMPTS = {
  plumbing: `
INDUSTRY CONTEXT: Plumbing/HVAC Services
FOCUS AREAS:
- Service addresses (critical for field work)
- Problem descriptions (for preparation and parts)
- Emergency indicators (water damage, no heat, flooding)
- Time preferences (morning/afternoon/evening availability)
- Price estimates or budget discussions

URGENCY CLASSIFICATION:
- EMERGENCY: flooding, burst pipes, no water/heat, sewage backup
- HIGH: water damage, worsening leaks, no hot water
- MEDIUM: routine repairs, slow drains, maintenance
- LOW: upgrades, inspections, "when convenient"

TERMINOLOGY:
- "come out" or "come by" = service_call
- "take a look" or "estimate" = quote
- "emergency" or "urgent" = emergency
  `;
  
  real_estate: `
INDUSTRY CONTEXT: Real Estate
FOCUS AREAS:
- Property addresses (essential for showings)
- Property types and features mentioned
- Buyer/seller status and timeline urgency
- Price ranges and budget discussions
- Decision maker identification

URGENCY CLASSIFICATION:
- HIGH: pre-approved buyers, cash buyers, "closing soon", competitive market
- MEDIUM: active buyers, timeline mentioned, serious interest
- LOW: "just looking", early exploration, no timeline

TERMINOLOGY:
- "showing" or "tour" = meeting
- "walk through" = inspection  
- "look at properties" = meeting
  `;
};
```

### Confidence Scoring Algorithm
```typescript
interface ConfidenceFactors {
  // Time Information Quality
  explicit_datetime: 0.95; // "January 15th at 2 PM"
  relative_time: 0.85;     // "tomorrow morning"
  vague_time: 0.6;         // "sometime this week"
  no_time: 0.3;            // "we should meet"
  
  // Location Information Quality  
  full_address: 0.95;      // "123 Main St, City, State"
  partial_address: 0.8;    // "Main Street" 
  general_location: 0.6;   // "downtown"
  no_location: 0.4;        // missing location
  
  // Customer Information Quality
  full_contact: 0.9;       // name + phone + email
  partial_contact: 0.7;    // name + phone OR name + email  
  name_only: 0.6;          // just name mentioned
  no_contact: 0.3;         // anonymous caller
  
  // Event Description Quality
  specific_task: 0.9;      // "fix kitchen sink leak"
  general_task: 0.7;       // "plumbing repair"
  vague_task: 0.5;         // "take a look"
  
  // Industry Context Match
  perfect_match: 0.95;     // clearly fits industry patterns
  good_match: 0.8;         // mostly fits patterns
  poor_match: 0.5;         // doesn't clearly fit
}

function calculateEventConfidence(extractedEvent: ExtractedEvent): number {
  let confidence = 1.0;
  
  // Apply time factor
  confidence *= getTimeFactor(extractedEvent.proposedDateTime);
  
  // Apply location factor  
  confidence *= getLocationFactor(extractedEvent.location);
  
  // Apply customer info factor
  confidence *= getCustomerInfoFactor(extractedEvent);
  
  // Apply task description factor
  confidence *= getTaskDescriptionFactor(extractedEvent.description);
  
  // Apply industry context factor
  confidence *= getIndustryContextFactor(extractedEvent, industry);
  
  // Apply transcription quality factor
  confidence *= extractedEvent.transcriptionConfidence || 0.8;
  
  return Math.min(confidence, 1.0);
}
```

## 📧 Email System Architecture

### Template Hierarchy
```typescript
interface EmailTemplateSystem {
  BaseEmailLayout: {
    // Universal email wrapper
    components: ['Header', 'Content', 'Footer'];
    styling: 'Mobile-first responsive';
    branding: 'Flynn.ai + Company name';
  };
  
  CallOverviewEmail: {
    // Main email template
    sections: [
      'CallSummaryCard',  // Topic, caller info, duration
      'ExtractedEvents',  // Event cards with actions
      'ActionButtons',    // Dashboard + transcript links
      'IndustryFooter'    // Industry-specific help text
    ];
    adaptations: 'Industry-specific terminology';
  };
  
  EventCard: {
    // Individual event display
    elements: [
      'EventTitle',       // AI-generated title
      'EventMetadata',    // Type, time, location, urgency
      'CustomerInfo',     // Contact details
      'PriceEstimate',    // If applicable
      'QuickActions'      // Confirm, Edit, Follow-up buttons
    ];
    styling: 'Urgency-based color coding';
  };
  
  IndustryAdaptations: {
    plumbing: {
      terminology: { appointment: 'service call' };
      colors: { primary: '#1e40af', emergency: '#dc2626' };
      helpText: 'Click any service request to confirm timing...';
    };
    
    real_estate: {
      terminology: { service_call: 'showing' };
      colors: { primary: '#059669', urgent: '#f59e0b' };
      helpText: 'Manage your showings and client meetings...';
    };
  };
}
```

### Email Generation Process
```typescript
async function generateCallOverviewEmail(callData: CallRecord): Promise<EmailData> {
  // 1. Industry Detection & Configuration
  const industry = await detectIndustry(callData.userId, callData.transcription);
  const config = getIndustryConfiguration(industry);
  
  // 2. Template Selection & Adaptation
  const templateId = selectEmailTemplate(industry, callData.events.length);
  const terminology = adaptTerminology(config.terminology);
  
  // 3. Content Generation
  const emailContent = {
    subject: generateSubjectLine(callData.mainTopic, callData.callerName, industry),
    callSummary: formatCallSummary(callData, terminology),
    events: callData.events.map(event => formatEventCard(event, config)),
    industryInsights: generateIndustryInsights(callData, industry),
    actionUrls: generateDeepLinks(callData.id, callData.events)
  };
  
  // 4. Attachment Generation
  const attachments = await generateEventAttachments(callData.events);
  
  // 5. Render Final Email
  const emailHtml = render(CallOverviewEmail({
    ...emailContent,
    companyName: callData.user.companyName,
    industry: industry
  }));
  
  return {
    html: emailHtml,
    attachments: attachments,
    subject: emailContent.subject,
    metadata: {
      callId: callData.id,
      industry: industry,
      eventCount: callData.events.length
    }
  };
}
```

## 📅 Calendar Integration Strategy

### Universal Calendar Interface
```typescript
interface UniversalCalendarProvider {
  // Provider Identification
  providerType: 'google' | 'outlook' | 'apple' | 'caldav';
  displayName: string;
  iconUrl: string;
  
  // Authentication
  authenticate(authCode: string): Promise<CalendarIntegration>;
  refreshToken(integration: CalendarIntegration): Promise<CalendarIntegration>;
  
  // Calendar Operations
  listCalendars(integration: CalendarIntegration): Promise<Calendar[]>;
  syncEvent(integration: CalendarIntegration, event: EventData): Promise<string>;
  updateEvent(integration: CalendarIntegration, eventId: string, event: EventData): Promise<void>;
  deleteEvent(integration: CalendarIntegration, eventId: string): Promise<void>;
  
  // Conflict Detection
  checkConflicts(integration: CalendarIntegration, event: EventData): Promise<ConflictInfo[]>;
  
  // Event Retrieval
  getEvents(integration: CalendarIntegration, timeRange: TimeRange): Promise<CalendarEvent[]>;
}
```

### Smart Conflict Resolution
```typescript
interface ConflictResolutionSystem {
  detection: {
    overlap: 'Direct time overlap between events';
    travel_time: 'Insufficient travel time between locations';
    adjacent: 'Back-to-back meetings without buffer';
    resource: 'Double-booked resources or staff';
  };
  
  resolution_strategies: {
    suggest_alternatives: 'Offer nearby available times';
    auto_reschedule: 'Automatically move less important events';
    buffer_adjustment: 'Reduce buffer times if acceptable';
    user_confirmation: 'Ask user to manually resolve';
  };
  
  industry_considerations: {
    plumbing: {
      travel_time_default: 15; // minutes between service calls
      emergency_override: true; // emergencies can override conflicts
      location_critical: true;  // must consider service addresses
    };
    
    real_estate: {
      travel_time_default: 20; // longer travel between properties
      showing_buffer: 15;      // buffer between showings
      client_priority: 'qualified_buyers_first';
    };
  };
}
```

## 🔒 Security & Compliance

### Security Framework
```typescript
interface SecurityRequirements {
  authentication: {
    provider: 'Supabase Auth (JWT-based)';
    session_management: 'Secure HTTP-only cookies';
    password_policy: 'Minimum 8 chars, complexity required';
    mfa_support: 'TOTP and SMS backup';
  };
  
  authorization: {
    row_level_security: 'All database tables protected';
    api_permissions: 'Role-based access control';
    resource_isolation: 'Users only access own data';
  };
  
  data_protection: {
    encryption_at_rest: 'Supabase native encryption';
    encryption_in_transit: 'TLS 1.3 for all connections';
    api_key_encryption: 'AES-256 for stored API keys';
    pii_handling: 'Minimal collection, secure storage';
  };
  
  api_security: {
    rate_limiting: '1000 req/hour per user, 10/min for webhooks';
    webhook_verification: 'Signature validation for all webhooks';
    cors_policy: 'Strict origin whitelisting';
    input_validation: 'Zod schemas for all inputs';
  };
}
```

### Industry Compliance
```typescript
interface ComplianceFramework {
  medical_hipaa: {
    data_minimization: 'No detailed medical info storage';
    audit_logging: 'All PHI access logged';
    encryption_required: 'End-to-end for patient data';
    user_training: 'HIPAA awareness documentation';
  };
  
  legal_privilege: {
    attorney_client: 'Mark privileged communications';
    conflict_checking: 'Basic conflict awareness';
    retention_policies: 'Configurable data retention';
  };
  
  gdpr_ccpa: {
    data_portability: 'Export user data functionality';
    right_to_deletion: 'Complete data removal';
    consent_management: 'Clear privacy policy acceptance';
    processing_lawfulness: 'Legitimate business interest';
  };
}
```

## 📊 Analytics & Monitoring

### Key Performance Indicators
```typescript
interface BusinessMetrics {
  // Core Performance
  call_to_email_time: {
    target: '< 2 minutes';
    measurement: 'webhook_received → email_sent';
    alerting: '> 5 minutes triggers alert';
  };
  
  ai_extraction_accuracy: {
    target: '90%+ event extraction accuracy';
    measurement: 'user_corrections / total_extractions';
    improvement: 'feedback_loop → prompt_optimization';
  };
  
  conversion_rates: {
    extracted_to_confirmed: 'How many AI events become real appointments';
    email_open_rate: 'Professional email engagement';
    calendar_sync_success: 'Integration reliability';
  };
  
  // Business Growth
  user_retention: {
    weekly_active: 'Users processing calls weekly';
    monthly_retention: 'Subscription retention rate';
    feature_adoption: 'Calendar sync, bulk actions usage';
  };
  
  // Technical Health
  system_uptime: {
    target: '99.9% uptime';
    measurement: 'API availability monitoring';
    dependencies: 'Supabase, OpenAI, Twilio, Resend';
  };
}
```

### Real-time Monitoring
```typescript
interface MonitoringSystem {
  application_monitoring: {
    errors: 'Sentry for error tracking and alerting';
    performance: 'Vercel analytics for page load times';
    user_behavior: 'PostHog for product analytics';
  };
  
  business_monitoring: {
    ai_processing: 'OpenAI API success/failure rates';
    email_delivery: 'Resend delivery and bounce rates';
    calendar_sync: 'Integration success rates by provider';
    webhook_health: 'Twilio webhook reliability';
  };
  
  alerting_rules: {
    critical: 'System down, AI processing failed';
    warning: 'High error rate, slow response time';
    info: 'Usage spikes, new user registrations';
  };
}
```

## 🚀 Development Roadmap

### MVP Definition (Phase 1-2)
```typescript
interface MVPFeatures {
  core_functionality: [
    'Twilio call processing',
    'AI event extraction (3 industries)',
    'Professional email delivery',
    'Basic dashboard with event management',
    'Google Calendar integration',
    'ICS file generation'
  ];
  
  success_criteria: [
    '< 2 minute call-to-email delivery',
    '85%+ AI extraction accuracy',
    'Mobile-responsive interface',
    'Successful payment processing',
    '99% uptime for 30 days'
  ];
  
  launch_timeline: '6-8 weeks for solo developer';
}
```

### Post-MVP Roadmap (Phase 3-5)
```typescript
interface GrowthFeatures {
  quarter_1: [
    'Outlook calendar integration',
    'SMS customer notifications', 
    'Advanced analytics dashboard',
    'Bulk event management',
    'API rate limiting and caching'
  ];
  
  quarter_2: [
    'Mobile PWA optimization',
    'Team collaboration features',
    'Advanced search and filtering',
    'Custom industry configurations',
    'Webhook API for integrations'
  ];
  
  quarter_3: [
    'Native mobile app (React Native)',
    'Advanced AI features (sentiment, follow-up)',
    'Enterprise SSO and compliance',
    'White-label solutions',
    'Advanced calendar conflict resolution'
  ];
}
```

## 💰 Business Considerations

### Pricing Strategy Implementation
```typescript
interface SubscriptionTiers {
  basic: {
    price: 29; // USD per month
    features: [
      'AI call notes and event extraction',
      'Professional email delivery',
      'Basic calendar integration (ICS files)',
      '100 calls per month',
      'Email support'
    ];
    target: 'Solo professionals, small contractors';
  };
  
  professional: {
    price: 79;
    features: [
      'Everything in Basic',
      'Advanced calendar sync (Google, Outlook)',
      'SMS customer notifications',
      'Bulk event management',
      '500 calls per month',
      'Priority support'
    ];
    target: 'Growing businesses, real estate teams';
  };
  
  enterprise: {
    price: 149;
    features: [
      'Everything in Professional',
      'Unlimited calls',
      'Custom industry configurations',
      'Team collaboration',
      'API access',
      'Dedicated support'
    ];
    target: 'Large organizations, franchise operations';
  };
}
```

### Go-to-Market Strategy
```typescript
interface GTMStrategy {
  phase_1_launch: {
    target_industry: 'plumbing'; // Clear pain point, willing to pay
    geography: 'US English-speaking markets';
    channels: ['Google Ads', 'Industry forums', 'Trade publications'];
    messaging: 'Never miss another service call appointment';
  };
  
  phase_2_expansion: {
    industries: ['real_estate', 'legal', 'medical'];
    features: 'Industry-specific optimizations';
    partnerships: 'CRM integrations, trade associations';
  };
  
  phase_3_scale: {
    international: 'Multi-language support';
    enterprise: 'Team features, compliance, SSO';
    platform: 'API ecosystem, integrations marketplace';
  };
}
```

## 🎯 Success Metrics & KPIs

### Technical Success Metrics
- **AI Accuracy**: 90%+ event extraction accuracy across all industries
- **System Performance**: < 2 minute call-to-email delivery, 99.9% uptime
- **Integration Reliability**: 95%+ calendar sync success rate
- **User Experience**: < 3 second page load times, mobile-first responsiveness

### Business Success Metrics  
- **User Adoption**: 1,000+ paying customers within 6 months
- **Revenue Growth**: $50K+ MRR within 12 months
- **Customer Satisfaction**: 4.5+ star average rating, < 5% churn rate
- **Market Validation**: 3+ industries with proven product-market fit

### Operational Success Metrics
- **Support Efficiency**: < 2 hour response time, self-service success rate
- **Development Velocity**: Weekly feature releases, < 1 day bug fix time
- **Cost Management**: < 30% of revenue on infrastructure and AI processing
- **Compliance**: Zero security incidents, industry compliance maintained

---

## 🧠 Claude Code Agent Instructions

When working on Flynn.ai v2, always:

1. **Context First**: Review this CLAUDE.md file for project understanding
2. **Industry-Aware**: Consider which industry you're building for and adapt accordingly
3. **Security-Focused**: Never compromise on data protection or user privacy
4. **Performance-Minded**: Optimize for the < 2 minute call-to-email target
5. **User-Centric**: Build for professionals who live on their phones
6. **Test-Driven**: Ensure 90%+ test coverage for all business-critical logic
7. **Documentation**: Update this file when adding new features or changing architecture
8. **Development Server**: Do not run npm dev. If you need to start the server, I can start it for you, just ask me.
9. **No Emojis**: Do not use emojis in code, UI components, or user-facing text. Keep the interface professional and clean.

### Common Tasks:
- **Adding New Industry**: Update industry configurations, AI prompts, email templates
- **API Changes**: Update API_STRUCTURE.md and ensure backward compatibility
- **UI Updates**: Maintain mobile-first responsive design principles
- **Database Changes**: Update DATABASE.md and create proper migrations
- **AI Improvements**: Test thoroughly across all industries before deploying

### Quick Reference:
- **Database Types**: `/types/database.types.ts`
- **API Routes**: `/app/api/`  
- **Industry Configs**: `/lib/industry/configurations.ts`
- **Email Templates**: `/components/email-templates/`
- **AI Prompts**: `/lib/ai/prompts/`

This is a high-impact, high-potential project. Build it with excellence. 🚀