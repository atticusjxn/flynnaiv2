# Flynn.ai v2 Testing Strategy

## Overview

Comprehensive testing approach ensuring reliability across multiple industries, AI accuracy, and seamless integrations. The strategy covers unit, integration, and end-to-end testing with industry-specific scenarios.

## Testing Philosophy

### Quality Gates

- **90%+ test coverage** for critical business logic
- **Zero critical bugs** in production
- **Industry-specific validation** for all workflows
- **Performance benchmarks** met consistently
- **Security vulnerabilities** addressed

### Test Pyramid Structure

```
        E2E Tests (10%)
    Integration Tests (30%)
   Unit Tests (60%)
```

## Test Environment Setup

### Local Development Testing

```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.{js,ts,tsx}',
    'app/**/*.{js,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// jest.setup.js
import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from '@jest/globals';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Supabase Test Database

```sql
-- Create test database with same schema as production
CREATE DATABASE flynn_test;

-- Use Supabase local development
-- supabase start
-- supabase db reset --db-url postgresql://postgres:postgres@localhost:54322/postgres
```

### Test Data Seeding

```typescript
// lib/testing/seedData.ts
export const TEST_DATA = {
  users: [
    {
      id: 'user-plumber-1',
      email: 'test.plumber@example.com',
      company_name: 'Smith Plumbing Services',
      industry_type: 'plumbing',
      subscription_tier: 'professional',
    },
    {
      id: 'user-realtor-1',
      email: 'test.realtor@example.com',
      company_name: 'Prime Real Estate',
      industry_type: 'real_estate',
      subscription_tier: 'basic',
    },
  ],

  calls: [
    {
      id: 'call-plumber-emergency',
      user_id: 'user-plumber-1',
      caller_number: '+15551234567',
      caller_name: 'Emergency Customer',
      transcription_text:
        'Hi, my basement is flooding and I need a plumber immediately. Can someone come out right now? My address is 123 Oak Street.',
      urgency_level: 'emergency',
      main_topic: 'Basement flooding emergency',
    },
  ],

  events: [
    {
      id: 'event-emergency-call',
      call_id: 'call-plumber-emergency',
      user_id: 'user-plumber-1',
      event_type: 'emergency',
      status: 'extracted',
      title: 'Emergency Basement Flooding',
      urgency_level: 'emergency',
    },
  ],
};

export async function seedTestData() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_TEST_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Clear existing data
  await supabase.from('events').delete().neq('id', '');
  await supabase.from('calls').delete().neq('id', '');
  await supabase.from('users').delete().neq('id', '');

  // Insert test data
  await supabase.from('users').insert(TEST_DATA.users);
  await supabase.from('calls').insert(TEST_DATA.calls);
  await supabase.from('events').insert(TEST_DATA.events);
}
```

## Unit Testing

### AI Extraction Testing

```typescript
// __tests__/lib/ai/aiExtraction.test.ts
import { AIExtractionPipeline } from '@/lib/ai/AIExtractionPipeline';
import { mockOpenAI } from '@/mocks/openai';

describe('AI Extraction Pipeline', () => {
  let aiPipeline: AIExtractionPipeline;

  beforeEach(() => {
    aiPipeline = new AIExtractionPipeline();
    mockOpenAI.reset();
  });

  describe('Industry-Specific Extraction', () => {
    it('should extract plumbing service calls correctly', async () => {
      const transcript =
        'My kitchen sink is leaking badly. Can you come fix it tomorrow morning around 9 AM? I live at 456 Pine Street.';

      mockOpenAI.mockCompletion({
        main_topic: 'Kitchen sink leak repair',
        events: [
          {
            event_type: 'service_call',
            title: 'Kitchen Sink Repair',
            proposed_datetime: '2025-01-16T09:00:00Z',
            location: '456 Pine Street',
            urgency_level: 'medium',
            ai_confidence: 0.92,
          },
        ],
      });

      const result = await aiPipeline.extractEvents({
        transcription: transcript,
        industry: 'plumbing',
        user_id: 'user-plumber-1',
      });

      expect(result.main_topic).toBe('Kitchen sink leak repair');
      expect(result.events).toHaveLength(1);
      expect(result.events[0].event_type).toBe('service_call');
      expect(result.events[0].urgency_level).toBe('medium');
    });

    it('should detect emergency situations', async () => {
      const transcript =
        'Emergency! My basement is flooding with water everywhere. I need someone right now!';

      mockOpenAI.mockCompletion({
        main_topic: 'Basement flooding emergency',
        events: [
          {
            event_type: 'emergency',
            urgency_level: 'emergency',
            ai_confidence: 0.95,
          },
        ],
      });

      const result = await aiPipeline.extractEvents({
        transcription: transcript,
        industry: 'plumbing',
      });

      expect(result.events[0].event_type).toBe('emergency');
      expect(result.events[0].urgency_level).toBe('emergency');
    });

    it('should handle real estate showings', async () => {
      const transcript =
        'Hi, I saw your listing for 789 Maple Avenue. Could I schedule a showing this Saturday afternoon?';

      mockOpenAI.mockCompletion({
        main_topic: 'Property showing request - 789 Maple Avenue',
        events: [
          {
            event_type: 'meeting',
            title: 'Property Showing - 789 Maple Avenue',
            proposed_datetime: null, // Vague timing
            location: '789 Maple Avenue',
            follow_up_required: true,
            ai_confidence: 0.88,
          },
        ],
      });

      const result = await aiPipeline.extractEvents({
        transcription: transcript,
        industry: 'real_estate',
      });

      expect(result.events[0].title).toContain('789 Maple Avenue');
      expect(result.events[0].follow_up_required).toBe(true);
    });
  });

  describe('Confidence Scoring', () => {
    it('should assign high confidence to clear requests', async () => {
      const transcript =
        'I need a plumber at 123 Main Street on January 15th at 2 PM for a sink repair.';

      const result = await aiPipeline.extractEvents({
        transcription: transcript,
        industry: 'plumbing',
      });

      expect(result.events[0].ai_confidence).toBeGreaterThan(0.9);
    });

    it('should assign low confidence to vague requests', async () => {
      const transcript =
        'Maybe we could meet up sometime to discuss that thing we talked about.';

      const result = await aiPipeline.extractEvents({
        transcription: transcript,
        industry: 'sales',
      });

      expect(result.events[0].ai_confidence).toBeLessThan(0.6);
    });
  });
});
```

### Calendar Integration Testing

```typescript
// __tests__/lib/calendar/calendarService.test.ts
import { CalendarService } from '@/lib/calendar/CalendarService';
import { mockGoogleCalendar } from '@/mocks/googleCalendar';

describe('Calendar Service', () => {
  let calendarService: CalendarService;

  beforeEach(() => {
    calendarService = new CalendarService();
    mockGoogleCalendar.reset();
  });

  describe('Event Synchronization', () => {
    it('should sync event to Google Calendar successfully', async () => {
      mockGoogleCalendar.mockCreateEvent('google-event-123');

      const result = await calendarService.syncEventToCalendar(
        'user-1',
        'event-1',
        'google'
      );

      expect(result.success).toBe(true);
      expect(result.calendarEventId).toBe('google-event-123');
      expect(mockGoogleCalendar.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: expect.any(String),
          start: expect.any(Object),
          end: expect.any(Object),
        })
      );
    });

    it('should detect and report calendar conflicts', async () => {
      mockGoogleCalendar.mockConflictingEvents([
        {
          id: 'existing-event',
          summary: 'Existing Meeting',
          start: { dateTime: '2025-01-16T14:00:00Z' },
          end: { dateTime: '2025-01-16T15:00:00Z' },
        },
      ]);

      const result = await calendarService.syncEventToCalendar(
        'user-1',
        'conflicting-event-1',
        'google'
      );

      expect(result.success).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].conflictType).toBe('overlap');
    });
  });
});
```

### Email Template Testing

```typescript
// __tests__/components/email-templates/CallOverviewEmail.test.tsx
import { render } from '@react-email/render';
import CallOverviewEmail from '@/components/email-templates/CallOverviewEmail';

describe('CallOverviewEmail Template', () => {
  const mockEmailData = {
    companyName: 'Test Plumbing Co',
    industry: 'plumbing',
    mainTopic: 'Kitchen sink repair',
    callSummary: 'Customer needs kitchen sink fixed',
    callerName: 'John Doe',
    callerNumber: '+15551234567',
    callDuration: 180,
    events: [
      {
        id: 'event-1',
        title: 'Kitchen Sink Repair',
        eventType: 'service_call',
        proposedDateTime: '2025-01-16T14:00:00Z',
        location: '123 Main St',
        description: 'Fix leaking sink',
        urgencyLevel: 'medium',
        customerName: 'John Doe',
      },
    ],
    dashboardUrl: 'https://flynn.ai/dashboard',
    transcriptUrl: 'https://flynn.ai/transcript',
  };

  it('should render email template correctly', () => {
    const html = render(CallOverviewEmail(mockEmailData));

    expect(html).toContain('Kitchen sink repair');
    expect(html).toContain('Test Plumbing Co');
    expect(html).toContain('John Doe');
    expect(html).toContain('Kitchen Sink Repair');
  });

  it('should adapt content for different industries', () => {
    const realEstateData = {
      ...mockEmailData,
      industry: 'real_estate',
      mainTopic: 'Property showing request',
      events: [
        {
          ...mockEmailData.events[0],
          eventType: 'meeting',
          title: 'Property Showing',
        },
      ],
    };

    const html = render(CallOverviewEmail(realEstateData));

    expect(html).toContain('Property showing request');
    expect(html).toContain('Property Showing');
  });

  it('should handle urgent events with appropriate styling', () => {
    const urgentData = {
      ...mockEmailData,
      events: [
        {
          ...mockEmailData.events[0],
          urgencyLevel: 'emergency',
        },
      ],
    };

    const html = render(CallOverviewEmail(urgentData));

    expect(html).toContain('EMERGENCY');
    // Check for emergency styling (red color)
    expect(html).toMatch(/border-left.*#dc2626|#dc2626.*border-left/);
  });
});
```

## Integration Testing

### API Endpoint Testing

```typescript
// __tests__/app/api/events/route.test.ts
import { POST, GET } from '@/app/api/events/route';
import { createMocks } from 'node-mocks-http';
import { seedTestData } from '@/lib/testing/seedData';

describe('Events API', () => {
  beforeEach(async () => {
    await seedTestData();
  });

  describe('GET /api/events', () => {
    it('should return user events with pagination', async () => {
      const { req } = createMocks({
        method: 'GET',
        query: { page: '1', limit: '20' },
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.events).toBeInstanceOf(Array);
      expect(data.pagination).toHaveProperty('total');
    });

    it('should filter events by status', async () => {
      const { req } = createMocks({
        method: 'GET',
        query: { status: 'pending' },
      });

      const response = await GET(req);
      const data = await response.json();

      data.events.forEach((event) => {
        expect(event.status).toBe('pending');
      });
    });
  });

  describe('POST /api/events', () => {
    it('should create new event', async () => {
      const eventData = {
        title: 'New Service Call',
        event_type: 'service_call',
        proposed_datetime: '2025-01-17T10:00:00Z',
        location: '789 New Street',
      };

      const { req } = createMocks({
        method: 'POST',
        body: eventData,
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.event.title).toBe(eventData.title);
    });

    it('should validate required fields', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {}, // Missing required fields
      });

      const response = await POST(req);

      expect(response.status).toBe(422);
    });
  });
});
```

### Twilio Webhook Testing

```typescript
// __tests__/app/api/webhooks/twilio/route.test.ts
import { POST } from '@/app/api/webhooks/twilio/voice/route';
import { createMocks } from 'node-mocks-http';

describe('Twilio Voice Webhook', () => {
  it('should handle incoming call webhook', async () => {
    const twilioPayload = {
      CallSid: 'CA1234567890abcdef',
      AccountSid: 'AC1234567890abcdef',
      To: '+15551234567',
      From: '+15559876543',
      CallStatus: 'ringing',
      Direction: 'inbound',
    };

    const { req } = createMocks({
      method: 'POST',
      body: twilioPayload,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const response = await POST(req);
    const responseText = await response.text();

    expect(response.status).toBe(200);
    expect(responseText).toContain('<Response>');
    expect(responseText).toContain('<Record');
  });

  it('should handle call recording completion', async () => {
    const recordingPayload = {
      CallSid: 'CA1234567890abcdef',
      RecordingSid: 'RE1234567890abcdef',
      RecordingUrl: 'https://api.twilio.com/recording.wav',
      RecordingDuration: '45',
    };

    const { req } = createMocks({
      method: 'POST',
      body: recordingPayload,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

## End-to-End Testing

### Complete Call Processing Flow

```typescript
// __tests__/e2e/callProcessing.test.ts
import { test, expect } from '@playwright/test';

test.describe('Call Processing End-to-End', () => {
  test('should process plumbing call from start to finish', async ({
    page,
  }) => {
    // 1. Simulate incoming call via Twilio webhook
    const callData = {
      CallSid: 'CA_test_call_123',
      From: '+15551234567',
      To: '+15557654321',
    };

    await page.request.post('/api/webhooks/twilio/voice', {
      data: callData,
    });

    // 2. Simulate call recording completion
    await page.request.post('/api/webhooks/twilio/recording', {
      data: {
        CallSid: 'CA_test_call_123',
        RecordingSid: 'RE_test_recording_123',
        RecordingUrl: 'https://test-recording.wav',
      },
    });

    // 3. Simulate transcription completion with plumbing content
    const transcriptionData = {
      CallSid: 'CA_test_call_123',
      TranscriptionText:
        'Hi, I have a leaking pipe in my bathroom. Can someone come fix it tomorrow morning? My name is Sarah and I live at 123 Oak Street.',
      TranscriptionStatus: 'completed',
    };

    await page.request.post('/api/webhooks/twilio/transcription', {
      data: transcriptionData,
    });

    // 4. Wait for AI processing to complete
    await page.waitForTimeout(5000);

    // 5. Login to dashboard
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test.plumber@example.com');
    await page.fill('[data-testid="password"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');

    // 6. Navigate to calls page
    await page.goto('/dashboard/calls');

    // 7. Verify call appears in dashboard
    await expect(
      page.locator('[data-testid="call-item"]').first()
    ).toContainText('Sarah');
    await expect(
      page.locator('[data-testid="call-topic"]').first()
    ).toContainText('leaking pipe');

    // 8. Click on call to view events
    await page.click('[data-testid="call-item"]');

    // 9. Verify event was extracted
    await expect(page.locator('[data-testid="event-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-title"]')).toContainText(
      'Bathroom Pipe Repair'
    );
    await expect(page.locator('[data-testid="event-location"]')).toContainText(
      '123 Oak Street'
    );

    // 10. Confirm the event
    await page.click('[data-testid="confirm-event-button"]');

    // 11. Verify status updated
    await expect(page.locator('[data-testid="event-status"]')).toContainText(
      'Confirmed'
    );

    // 12. Verify calendar sync option appears
    await expect(
      page.locator('[data-testid="sync-calendar-button"]')
    ).toBeVisible();
  });

  test('should handle real estate showing request', async ({ page }) => {
    // Similar E2E test but for real estate industry
    const transcriptionData = {
      CallSid: 'CA_realtor_call_123',
      TranscriptionText:
        "I saw your listing for 456 Maple Avenue. Could we schedule a showing this weekend? I'm pre-approved and ready to make an offer. This is Mike Johnson, 555-9876.",
      TranscriptionStatus: 'completed',
    };

    await page.request.post('/api/webhooks/twilio/transcription', {
      data: transcriptionData,
    });

    await page.waitForTimeout(5000);

    // Login as real estate agent
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test.realtor@example.com');
    await page.fill('[data-testid="password"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');

    await page.goto('/dashboard/events');

    // Verify real estate event extraction
    await expect(
      page.locator('[data-testid="event-title"]').first()
    ).toContainText('Property Showing - 456 Maple Avenue');
    await expect(
      page.locator('[data-testid="event-type"]').first()
    ).toContainText('Meeting');
    await expect(
      page.locator('[data-testid="urgency-badge"]').first()
    ).toContainText('High Priority');
  });
});
```

### Email Template Rendering E2E

```typescript
// __tests__/e2e/emailFlow.test.ts
import { test, expect } from '@playwright/test';

test.describe('Email Template Flow', () => {
  test('should send and render call overview email', async ({
    page,
    context,
  }) => {
    // Setup email testing
    const emailPage = await context.newPage();

    // Trigger email send via API
    const emailResponse = await page.request.post('/api/test/send-email', {
      data: {
        userId: 'test-user-1',
        callId: 'test-call-1',
        industry: 'plumbing',
      },
    });

    expect(emailResponse.ok()).toBe(true);

    // Check email preview endpoint
    await emailPage.goto('/api/email/preview?industry=plumbing');

    // Verify email content
    await expect(emailPage.locator('h1')).toContainText('Flynn.ai');
    await expect(emailPage.locator('[data-testid="main-topic"]')).toBeVisible();
    await expect(emailPage.locator('[data-testid="event-card"]')).toBeVisible();
    await expect(
      emailPage.locator('[data-testid="dashboard-button"]')
    ).toBeVisible();

    // Test responsive design
    await emailPage.setViewportSize({ width: 400, height: 800 });
    await expect(emailPage.locator('[data-testid="event-card"]')).toBeVisible();

    // Test email buttons
    const dashboardLink = await emailPage
      .locator('[data-testid="dashboard-button"]')
      .getAttribute('href');
    expect(dashboardLink).toContain('/dashboard');
  });
});
```

## Performance Testing

### Load Testing for AI Processing

```typescript
// __tests__/performance/aiProcessing.test.ts
import { performance } from 'perf_hooks';
import { AIExtractionPipeline } from '@/lib/ai/AIExtractionPipeline';

describe('AI Processing Performance', () => {
  test('should process calls within performance budget', async () => {
    const aiPipeline = new AIExtractionPipeline();
    const testTranscripts = generateTestTranscripts(50); // 50 different transcripts

    const startTime = performance.now();

    const promises = testTranscripts.map((transcript) =>
      aiPipeline.extractEvents({
        transcription: transcript,
        industry: 'plumbing',
      })
    );

    await Promise.all(promises);

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / testTranscripts.length;

    // Should process each call in under 10 seconds on average
    expect(averageTime).toBeLessThan(10000);
  });

  test('should handle concurrent call processing', async () => {
    const concurrentCalls = 10;
    const promises = Array.from({ length: concurrentCalls }, (_, i) =>
      simulateIncomingCall(`test-call-${i}`)
    );

    const results = await Promise.allSettled(promises);
    const successful = results.filter((r) => r.status === 'fulfilled').length;

    // At least 80% should succeed under load
    expect(successful / concurrentCalls).toBeGreaterThan(0.8);
  });
});
```

### Database Performance Testing

```typescript
// __tests__/performance/database.test.ts
describe('Database Performance', () => {
  test('should handle high-volume event queries', async () => {
    // Insert 1000 test events
    await seedLargeDataSet(1000);

    const startTime = performance.now();

    // Query with filters and pagination
    const result = await supabase
      .from('events')
      .select('*')
      .eq('user_id', 'test-user')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(0, 19);

    const endTime = performance.now();
    const queryTime = endTime - startTime;

    // Should complete in under 1 second
    expect(queryTime).toBeLessThan(1000);
    expect(result.data).toHaveLength(20);
  });
});
```

## Industry-Specific Test Scenarios

### Plumbing Industry Tests

```typescript
// __tests__/industries/plumbing.test.ts
describe('Plumbing Industry Workflows', () => {
  const plumbingScenarios = [
    {
      name: 'Emergency water damage',
      transcript:
        'Help! My pipe burst and water is everywhere! I need someone right now at 123 Main Street!',
      expectedEventType: 'emergency',
      expectedUrgency: 'emergency',
      expectedTitle: expect.stringContaining('water'),
    },
    {
      name: 'Routine sink repair',
      transcript:
        'My kitchen sink drips occasionally. Could someone come look at it this week?',
      expectedEventType: 'service_call',
      expectedUrgency: 'low',
      expectedFollowUp: true,
    },
    {
      name: 'Quote request',
      transcript:
        'I need a quote for installing a new water heater. Can you come assess the job?',
      expectedEventType: 'quote',
      expectedUrgency: 'medium',
      expectedPricing: true,
    },
  ];

  plumbingScenarios.forEach((scenario) => {
    test(`should handle ${scenario.name}`, async () => {
      const result = await processCall(scenario.transcript, 'plumbing');

      expect(result.events[0].event_type).toBe(scenario.expectedEventType);
      expect(result.events[0].urgency_level).toBe(scenario.expectedUrgency);

      if (scenario.expectedTitle) {
        expect(result.events[0].title).toEqual(scenario.expectedTitle);
      }

      if (scenario.expectedFollowUp) {
        expect(result.events[0].follow_up_required).toBe(true);
      }

      if (scenario.expectedPricing) {
        expect(result.events[0].price_estimate).toBeGreaterThan(0);
      }
    });
  });
});
```

### Real Estate Industry Tests

```typescript
// __tests__/industries/realEstate.test.ts
describe('Real Estate Industry Workflows', () => {
  test('should handle property showing requests', async () => {
    const transcript =
      'I want to see the house at 789 Pine Street listed for $450K. I can do Saturday afternoon.';

    const result = await processCall(transcript, 'real_estate');

    expect(result.events[0].event_type).toBe('meeting');
    expect(result.events[0].title).toContain('789 Pine Street');
    expect(result.events[0].location).toBe('789 Pine Street');
    expect(result.events[0].notes).toContain('$450K');
  });

  test('should identify qualified buyers', async () => {
    const transcript =
      "I'm pre-approved for $600K and looking in the downtown area. Can we schedule some showings?";

    const result = await processCall(transcript, 'real_estate');

    expect(result.events[0].urgency_level).toBe('high');
    expect(result.events[0].notes).toContain('pre-approved');
    expect(result.events[0].notes).toContain('$600K');
  });
});
```

## Test Automation & CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/flynn_test

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Start Supabase
        run: npx supabase start

      - name: Run integration tests
        run: npm run test:integration
        env:
          SUPABASE_URL: http://localhost:54321
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Playwright
        run: npx playwright install

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload E2E artifacts
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Data Management

### Test Data Factory

```typescript
// lib/testing/factories.ts
import { faker } from '@faker-js/faker';

export class TestDataFactory {
  static createUser(overrides?: Partial<User>): User {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      full_name: faker.person.fullName(),
      company_name: faker.company.name(),
      industry_type: faker.helpers.arrayElement([
        'plumbing',
        'real_estate',
        'legal',
        'medical',
        'sales',
      ]),
      subscription_tier: faker.helpers.arrayElement([
        'basic',
        'professional',
        'enterprise',
      ]),
      created_at: faker.date.past(),
      ...overrides,
    };
  }

  static createCall(overrides?: Partial<Call>): Call {
    return {
      id: faker.string.uuid(),
      twilio_call_sid: `CA${faker.string.alphanumeric(32)}`,
      caller_number: faker.phone.number(),
      caller_name: faker.person.fullName(),
      call_duration: faker.number.int({ min: 30, max: 600 }),
      transcription_text: faker.lorem.sentences(5),
      main_topic: faker.lorem.words(4),
      urgency_level: faker.helpers.arrayElement([
        'low',
        'medium',
        'high',
        'emergency',
      ]),
      created_at: faker.date.past(),
      ...overrides,
    };
  }

  static createEvent(overrides?: Partial<Event>): Event {
    const eventTypes = [
      'service_call',
      'meeting',
      'appointment',
      'demo',
      'follow_up',
      'quote',
    ];

    return {
      id: faker.string.uuid(),
      event_type: faker.helpers.arrayElement(eventTypes),
      status: faker.helpers.arrayElement([
        'extracted',
        'pending',
        'confirmed',
        'completed',
      ]),
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      proposed_datetime: faker.date.future().toISOString(),
      duration_minutes: faker.helpers.arrayElement([30, 60, 90, 120]),
      location: faker.location.streetAddress(),
      customer_name: faker.person.fullName(),
      customer_phone: faker.phone.number(),
      urgency_level: faker.helpers.arrayElement([
        'low',
        'medium',
        'high',
        'emergency',
      ]),
      ai_confidence: faker.number.float({
        min: 0.5,
        max: 1.0,
        precision: 0.01,
      }),
      created_at: faker.date.past(),
      ...overrides,
    };
  }
}
```

## Quality Assurance Checklist

### Pre-Release Testing Checklist

- [ ] All unit tests passing (90%+ coverage)
- [ ] Integration tests passing
- [ ] E2E tests for critical paths
- [ ] Performance benchmarks met
- [ ] Security vulnerabilities resolved
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] Email template rendering tested
- [ ] Calendar integration tested
- [ ] AI extraction accuracy validated
- [ ] Industry-specific workflows tested
- [ ] Database migrations tested
- [ ] API rate limiting verified
- [ ] Error handling tested
- [ ] Accessibility standards met

### Test Metrics & Reporting

```typescript
// lib/testing/metrics.ts
export class TestMetrics {
  static async generateTestReport() {
    return {
      coverage: await getCoverageReport(),
      performance: await getPerformanceMetrics(),
      aiAccuracy: await getAIExtractionMetrics(),
      industryCompliance: await getIndustryTestResults(),
      timestamp: new Date().toISOString(),
    };
  }
}
```

This comprehensive testing strategy ensures Flynn.ai v2 meets high quality standards across all industries and use cases while maintaining performance and reliability.
