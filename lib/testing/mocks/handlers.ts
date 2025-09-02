import { http, HttpResponse } from 'msw'

export const handlers = [
  // OpenAI API mocks
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [{
        message: {
          content: JSON.stringify({
            main_topic: 'Kitchen sink repair',
            events: [{
              event_type: 'service_call',
              title: 'Kitchen Sink Repair',
              proposed_datetime: '2025-01-16T14:00:00Z',
              location: '123 Main Street',
              description: 'Fix leaking kitchen sink',
              urgency_level: 'medium',
              ai_confidence: 0.92,
              customer_name: 'John Doe',
              customer_phone: '+15551234567'
            }]
          })
        }
      }],
      usage: { total_tokens: 150 }
    })
  }),

  // Supabase API mocks
  http.get('http://localhost:54321/rest/v1/users', () => {
    return HttpResponse.json([
      {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        company_name: 'Test Company',
        industry_type: 'plumbing',
        subscription_tier: 'professional'
      }
    ])
  }),

  http.get('http://localhost:54321/rest/v1/calls', () => {
    return HttpResponse.json([
      {
        id: 'call-1',
        user_id: 'user-1',
        twilio_call_sid: 'CA123456',
        caller_number: '+15551234567',
        caller_name: 'John Doe',
        transcription_text: 'My kitchen sink is leaking',
        main_topic: 'Kitchen sink repair',
        urgency_level: 'medium',
        created_at: '2025-01-15T10:00:00Z'
      }
    ])
  }),

  http.get('http://localhost:54321/rest/v1/events', () => {
    return HttpResponse.json([
      {
        id: 'event-1',
        call_id: 'call-1',
        user_id: 'user-1',
        event_type: 'service_call',
        status: 'pending',
        title: 'Kitchen Sink Repair',
        proposed_datetime: '2025-01-16T14:00:00Z',
        location: '123 Main Street',
        urgency_level: 'medium',
        ai_confidence: 0.92
      }
    ])
  }),

  // Twilio API mocks
  http.post('https://api.twilio.com/2010-04-01/Accounts/*/Messages.json', () => {
    return HttpResponse.json({
      sid: 'SM123456',
      status: 'sent'
    })
  }),

  // Resend API mocks
  http.post('https://api.resend.com/emails', () => {
    return HttpResponse.json({
      id: 'email-123',
      from: 'flynn@example.com',
      to: ['customer@example.com'],
      created_at: '2025-01-15T10:00:00Z'
    })
  }),
]