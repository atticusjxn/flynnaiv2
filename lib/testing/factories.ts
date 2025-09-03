import { faker } from '@faker-js/faker';

export interface TestUser {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  industry_type: string;
  subscription_tier: string;
  created_at: string;
}

export interface TestCall {
  id: string;
  user_id: string;
  twilio_call_sid: string;
  caller_number: string;
  caller_name: string;
  call_duration: number;
  transcription_text: string;
  main_topic: string;
  urgency_level: string;
  created_at: string;
}

export interface TestEvent {
  id: string;
  call_id: string;
  user_id: string;
  event_type: string;
  status: string;
  title: string;
  description: string;
  proposed_datetime: string;
  duration_minutes: number;
  location: string;
  customer_name: string;
  customer_phone: string;
  urgency_level: string;
  ai_confidence: number;
  created_at: string;
}

export class TestDataFactory {
  static createUser(overrides?: Partial<TestUser>): TestUser {
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
      created_at: faker.date.past().toISOString(),
      ...overrides,
    };
  }

  static createCall(overrides?: Partial<TestCall>): TestCall {
    return {
      id: faker.string.uuid(),
      user_id: faker.string.uuid(),
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
      created_at: faker.date.past().toISOString(),
      ...overrides,
    };
  }

  static createEvent(overrides?: Partial<TestEvent>): TestEvent {
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
      call_id: faker.string.uuid(),
      user_id: faker.string.uuid(),
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
      created_at: faker.date.past().toISOString(),
      ...overrides,
    };
  }

  static createPlumbingCall(): TestCall {
    const transcripts = [
      'My kitchen sink is leaking badly. Can you come fix it tomorrow morning around 9 AM? I live at 456 Pine Street.',
      'Emergency! My basement is flooding with water everywhere. I need someone right now at 123 Emergency Street!',
      'I need a quote for installing a new water heater. Can you come assess the job this week?',
      "My toilet won't stop running and it's wasting water. Could someone come look at it?",
    ];

    return this.createCall({
      transcription_text: faker.helpers.arrayElement(transcripts),
      main_topic: faker.helpers.arrayElement([
        'Kitchen sink leak repair',
        'Emergency basement flooding',
        'Water heater installation quote',
        'Toilet repair',
      ]),
      urgency_level: faker.helpers.arrayElement(['medium', 'emergency', 'low']),
    });
  }

  static createRealEstateCall(): TestCall {
    const transcripts = [
      'I saw your listing for 789 Maple Avenue. Could I schedule a showing this Saturday afternoon?',
      "I'm pre-approved for $600K and looking in the downtown area. Can we schedule some showings?",
      'I want to see the house at 456 Oak Street listed for $450K. I can do weekday evenings.',
    ];

    return this.createCall({
      transcription_text: faker.helpers.arrayElement(transcripts),
      main_topic: faker.helpers.arrayElement([
        'Property showing request - 789 Maple Avenue',
        'Pre-approved buyer - downtown properties',
        'House viewing - 456 Oak Street',
      ]),
      urgency_level: faker.helpers.arrayElement(['high', 'medium']),
    });
  }
}

export const TEST_DATA = {
  users: [
    {
      id: 'user-plumber-1',
      email: 'test.plumber@example.com',
      full_name: 'John Smith',
      company_name: 'Smith Plumbing Services',
      industry_type: 'plumbing',
      subscription_tier: 'professional',
    },
    {
      id: 'user-realtor-1',
      email: 'test.realtor@example.com',
      full_name: 'Sarah Johnson',
      company_name: 'Prime Real Estate',
      industry_type: 'real_estate',
      subscription_tier: 'basic',
    },
  ],

  calls: [
    {
      id: 'call-plumber-emergency',
      user_id: 'user-plumber-1',
      twilio_call_sid: 'CA_emergency_123',
      caller_number: '+15551234567',
      caller_name: 'Emergency Customer',
      call_duration: 120,
      transcription_text:
        'Hi, my basement is flooding and I need a plumber immediately. Can someone come out right now? My address is 123 Oak Street.',
      main_topic: 'Basement flooding emergency',
      urgency_level: 'emergency',
      created_at: '2025-01-15T10:00:00Z',
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
      description: 'Customer needs immediate assistance with basement flooding',
      proposed_datetime: '2025-01-15T11:00:00Z',
      duration_minutes: 120,
      location: '123 Oak Street',
      customer_name: 'Emergency Customer',
      customer_phone: '+15551234567',
      urgency_level: 'emergency',
      ai_confidence: 0.95,
      created_at: '2025-01-15T10:05:00Z',
    },
  ],
};
