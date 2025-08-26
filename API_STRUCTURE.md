# Flynn.ai v2 API Structure

## Overview
RESTful API built with Next.js 14 App Router, providing endpoints for call processing, event management, calendar integration, and user management.

## Base URL Structure
```
Production: https://flynn.ai/api
Development: http://localhost:3000/api
```

## Authentication
All protected endpoints require authentication via Supabase Auth.

**Headers Required:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## API Endpoints

### 1. Twilio Webhooks (Public Endpoints)

#### POST /api/webhooks/twilio/voice
Handle incoming call events from Twilio.

**Request Body:**
```json
{
  "CallSid": "CA1234567890abcdef",
  "AccountSid": "AC1234567890abcdef", 
  "To": "+15551234567",
  "From": "+15559876543",
  "CallStatus": "ringing",
  "Direction": "inbound"
}
```

**Response:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you for calling. Please leave your message after the tone.</Say>
  <Record 
    action="/api/webhooks/twilio/recording" 
    transcribe="true"
    transcribeCallback="/api/webhooks/twilio/transcription"
    maxLength="300"
    playBeep="true"
  />
</Response>
```

#### POST /api/webhooks/twilio/recording
Handle call recording completion.

**Request Body:**
```json
{
  "CallSid": "CA1234567890abcdef",
  "RecordingSid": "RE1234567890abcdef",
  "RecordingUrl": "https://api.twilio.com/recording.wav",
  "RecordingDuration": "45"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Recording processed"
}
```

#### POST /api/webhooks/twilio/transcription
Handle transcription completion and trigger AI processing.

**Request Body:**
```json
{
  "CallSid": "CA1234567890abcdef",
  "TranscriptionText": "Hi, I need a plumber to fix my sink...",
  "TranscriptionStatus": "completed",
  "TranscriptionUrl": "https://api.twilio.com/transcription.txt"
}
```

**Response:**
```json
{
  "success": true,
  "events_extracted": 2,
  "email_sent": true
}
```

### 2. Call Management

#### GET /api/calls
Retrieve user's call history with pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `status` (string): Filter by call status
- `date_from` (string): Filter from date (ISO)
- `date_to` (string): Filter to date (ISO)

**Response:**
```json
{
  "calls": [
    {
      "id": "uuid",
      "twilio_call_sid": "CA123",
      "caller_number": "+15559876543",
      "caller_name": "John Doe",
      "call_status": "completed",
      "call_duration": 180,
      "main_topic": "Kitchen sink repair",
      "urgency_level": "medium",
      "created_at": "2025-01-15T10:30:00Z",
      "events_count": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### GET /api/calls/[id]
Retrieve specific call details with transcript and events.

**Response:**
```json
{
  "call": {
    "id": "uuid",
    "twilio_call_sid": "CA123",
    "caller_number": "+15559876543",
    "caller_name": "John Doe",
    "call_duration": 180,
    "recording_url": "https://...",
    "transcription_text": "Hi, I need a plumber...",
    "main_topic": "Kitchen sink repair",
    "call_summary": "Customer needs kitchen sink repair...",
    "urgency_level": "medium",
    "created_at": "2025-01-15T10:30:00Z"
  },
  "events": [
    {
      "id": "uuid",
      "event_type": "service_call",
      "status": "pending",
      "title": "Kitchen Sink Repair",
      "proposed_datetime": "2025-01-16T14:00:00Z",
      "customer_name": "John Doe",
      "customer_phone": "+15559876543",
      "location": "123 Main St, City, State"
    }
  ]
}
```

#### POST /api/calls/[id]/reprocess
Reprocess call with AI for event extraction.

**Response:**
```json
{
  "success": true,
  "events_extracted": 2,
  "message": "Call reprocessed successfully"
}
```

### 3. Event Management

#### GET /api/events
Retrieve user's events with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status (extracted|pending|confirmed|tentative|completed|cancelled)
- `event_type` (string): Filter by event type
- `date_from` (string): Filter from date
- `date_to` (string): Filter to date
- `search` (string): Search in title/description

**Response:**
```json
{
  "events": [
    {
      "id": "uuid",
      "call_id": "uuid",
      "event_type": "service_call",
      "status": "pending",
      "title": "Kitchen Sink Repair",
      "description": "Fix leaking kitchen sink",
      "proposed_datetime": "2025-01-16T14:00:00Z",
      "confirmed_datetime": null,
      "duration_minutes": 90,
      "location": "123 Main St",
      "customer_name": "John Doe",
      "customer_phone": "+15559876543",
      "price_estimate": 150.00,
      "urgency_level": "medium",
      "ai_confidence": 0.87,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "pages": 1
  }
}
```

#### GET /api/events/[id]
Retrieve specific event details.

**Response:**
```json
{
  "event": {
    "id": "uuid",
    "call_id": "uuid",
    "event_type": "service_call",
    "status": "pending",
    "title": "Kitchen Sink Repair",
    "description": "Fix leaking kitchen sink under cabinet",
    "proposed_datetime": "2025-01-16T14:00:00Z",
    "confirmed_datetime": null,
    "duration_minutes": 90,
    "location": "123 Main St, Anytown, ST 12345",
    "location_type": "address",
    "customer_name": "John Doe",
    "customer_phone": "+15559876543",
    "customer_email": "john@email.com",
    "price_estimate": 150.00,
    "urgency_level": "medium",
    "notes": "Customer mentioned it's been leaking for 2 days",
    "ai_confidence": 0.87,
    "follow_up_required": false,
    "calendar_synced": false,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  },
  "call": {
    "id": "uuid",
    "caller_number": "+15559876543",
    "created_at": "2025-01-15T10:30:00Z",
    "transcription_text": "Hi, I need a plumber..."
  }
}
```

#### PUT /api/events/[id]
Update event details.

**Request Body:**
```json
{
  "title": "Updated Kitchen Sink Repair",
  "confirmed_datetime": "2025-01-16T15:00:00Z",
  "duration_minutes": 120,
  "location": "123 Main St, Anytown, ST 12345",
  "customer_email": "john.doe@email.com",
  "price_estimate": 175.00,
  "notes": "Bring extra parts - older house"
}
```

**Response:**
```json
{
  "event": {
    "id": "uuid",
    "title": "Updated Kitchen Sink Repair",
    "confirmed_datetime": "2025-01-16T15:00:00Z",
    "updated_at": "2025-01-15T11:00:00Z"
  }
}
```

#### PATCH /api/events/[id]/status
Update event status.

**Request Body:**
```json
{
  "status": "confirmed",
  "confirmed_datetime": "2025-01-16T15:00:00Z"
}
```

**Response:**
```json
{
  "event": {
    "id": "uuid",
    "status": "confirmed",
    "confirmed_datetime": "2025-01-16T15:00:00Z",
    "updated_at": "2025-01-15T11:00:00Z"
  }
}
```

#### POST /api/events/bulk-update
Update multiple events at once.

**Request Body:**
```json
{
  "event_ids": ["uuid1", "uuid2", "uuid3"],
  "updates": {
    "status": "confirmed"
  }
}
```

**Response:**
```json
{
  "success": true,
  "updated_count": 3,
  "events": [
    {
      "id": "uuid1",
      "status": "confirmed",
      "updated_at": "2025-01-15T11:00:00Z"
    }
  ]
}
```

#### DELETE /api/events/[id]
Delete (cancel) an event.

**Response:**
```json
{
  "success": true,
  "message": "Event cancelled successfully"
}
```

### 4. Calendar Integration

#### GET /api/calendar/integrations
Get user's calendar integrations.

**Response:**
```json
{
  "integrations": [
    {
      "id": "uuid",
      "integration_type": "google",
      "calendar_name": "Work Calendar",
      "is_active": true,
      "sync_enabled": true,
      "last_sync_at": "2025-01-15T09:00:00Z"
    }
  ]
}
```

#### POST /api/calendar/integrations
Add new calendar integration.

**Request Body:**
```json
{
  "integration_type": "google",
  "authorization_code": "auth_code_from_oauth"
}
```

**Response:**
```json
{
  "integration": {
    "id": "uuid",
    "integration_type": "google",
    "calendar_name": "Primary",
    "is_active": true,
    "sync_enabled": true
  }
}
```

#### POST /api/calendar/sync/[event_id]
Sync specific event to calendar.

**Response:**
```json
{
  "success": true,
  "calendar_event_id": "google_event_id",
  "calendar_url": "https://calendar.google.com/..."
}
```

#### GET /api/calendar/ics/[event_id]
Generate ICS file for event.

**Response:**
```
Content-Type: text/calendar
Content-Disposition: attachment; filename="event.ics"

BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Flynn.ai//Event//EN
BEGIN:VEVENT
UID:uuid@flynn.ai
DTSTAMP:20250115T100000Z
DTSTART:20250116T140000Z
DTEND:20250116T150000Z
SUMMARY:Kitchen Sink Repair
DESCRIPTION:Fix leaking kitchen sink
LOCATION:123 Main St, Anytown, ST 12345
END:VEVENT
END:VCALENDAR
```

### 5. Communication

#### POST /api/communications/send
Send confirmation email or SMS to customer.

**Request Body:**
```json
{
  "event_id": "uuid",
  "communication_type": "email",
  "recipient": "customer@email.com",
  "template": "confirmation",
  "custom_message": "Looking forward to helping you!"
}
```

**Response:**
```json
{
  "success": true,
  "communication_id": "uuid",
  "external_id": "resend_message_id",
  "status": "sent"
}
```

#### GET /api/communications
Get communication history.

**Query Parameters:**
- `event_id` (string): Filter by event
- `type` (string): Filter by communication type

**Response:**
```json
{
  "communications": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "communication_type": "email",
      "recipient": "customer@email.com",
      "subject": "Appointment Confirmed",
      "status": "delivered",
      "sent_at": "2025-01-15T11:00:00Z"
    }
  ]
}
```

### 6. Analytics

#### GET /api/analytics/dashboard
Get dashboard analytics.

**Query Parameters:**
- `date_from` (string): Start date for analytics
- `date_to` (string): End date for analytics

**Response:**
```json
{
  "analytics": {
    "total_calls": 45,
    "total_events": 52,
    "conversion_rate": 87.5,
    "events_by_status": {
      "pending": 8,
      "confirmed": 32,
      "completed": 12
    },
    "events_by_type": {
      "service_call": 28,
      "quote": 15,
      "follow_up": 9
    },
    "revenue_estimate": 4250.00,
    "average_response_time": 1.2
  }
}
```

#### GET /api/analytics/events
Get detailed event analytics.

**Response:**
```json
{
  "analytics": {
    "events_over_time": [
      {
        "date": "2025-01-15",
        "count": 5,
        "confirmed": 4,
        "revenue": 520.00
      }
    ],
    "conversion_funnel": {
      "extracted": 100,
      "pending": 85,
      "confirmed": 74,
      "completed": 68
    },
    "top_event_types": [
      {
        "type": "service_call",
        "count": 28,
        "revenue": 3200.00
      }
    ]
  }
}
```

### 7. User Management

#### GET /api/user/profile
Get user profile information.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@email.com",
    "full_name": "John Smith",
    "company_name": "Smith Plumbing",
    "industry_type": "plumbing",
    "subscription_tier": "professional",
    "phone_number": "+15551234567",
    "timezone": "America/New_York",
    "settings": {
      "email_notifications": true,
      "sms_notifications": false
    }
  }
}
```

#### PUT /api/user/profile
Update user profile.

**Request Body:**
```json
{
  "full_name": "John Smith Jr.",
  "company_name": "Smith & Son Plumbing",
  "phone_number": "+15551234568",
  "settings": {
    "email_notifications": true,
    "sms_notifications": true
  }
}
```

#### GET /api/user/settings
Get user settings and preferences.

**Response:**
```json
{
  "settings": {
    "industry_configuration": {
      "industry_type": "plumbing",
      "event_types": ["service_call", "quote", "emergency"],
      "default_duration": 90,
      "auto_confirm_enabled": false
    },
    "notification_preferences": {
      "email_notifications": true,
      "sms_notifications": true,
      "calendar_reminders": true
    },
    "email_templates": [
      {
        "id": "uuid",
        "template_name": "Service Call Confirmation",
        "is_active": true
      }
    ]
  }
}
```

#### PUT /api/user/settings
Update user settings.

**Request Body:**
```json
{
  "industry_configuration": {
    "default_duration": 120,
    "auto_confirm_enabled": true
  },
  "notification_preferences": {
    "sms_notifications": false
  }
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid event status",
    "details": {
      "field": "status",
      "value": "invalid_status",
      "allowed": ["pending", "confirmed", "cancelled"]
    }
  }
}
```

### Common Error Codes
- `AUTHENTICATION_REQUIRED` (401): Missing or invalid auth token
- `FORBIDDEN` (403): User doesn't have access to resource
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (422): Request validation failed
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

### Rate Limits by Endpoint Type
- **Public Webhooks**: No limit (Twilio verified)
- **Standard API**: 1000 requests/hour per user
- **Analytics**: 100 requests/hour per user
- **Bulk Operations**: 10 requests/hour per user

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642694400
```

## Webhooks for Client Applications

### Event Notifications
Flynn.ai can send webhooks to client applications for real-time updates.

#### POST [client_webhook_url]
```json
{
  "event": "event.status_changed",
  "data": {
    "event_id": "uuid",
    "old_status": "pending",
    "new_status": "confirmed",
    "timestamp": "2025-01-15T11:00:00Z"
  }
}
```

## API Versioning

### Version Strategy
- Current Version: `v1`
- URL Format: `/api/v1/endpoint`
- Header Format: `API-Version: 2025-01-15`

### Deprecation Policy
- 6 months notice for breaking changes
- Backward compatibility for minor updates
- Version sunset after 12 months

## Testing Endpoints

### Development/Testing
```bash
# Health check
curl https://flynn.ai/api/health

# Authentication test
curl -H "Authorization: Bearer <token>" https://flynn.ai/api/user/profile
```

This API structure provides a comprehensive foundation for the Flynn.ai v2 platform, supporting all business types with flexible event management and robust integration capabilities.