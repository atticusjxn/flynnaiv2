# Flynn.ai v2 Database Schema

## Overview
Supabase PostgreSQL database designed for universal business call-to-calendar platform supporting multiple industries with flexible event management.

## Database Tables

### 1. Users Table
Stores user accounts with subscription and industry information.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  industry_type TEXT CHECK (industry_type IN ('plumbing', 'real_estate', 'legal', 'medical', 'sales', 'consulting', 'general_services', 'other')),
  subscription_tier TEXT CHECK (subscription_tier IN ('basic', 'professional', 'enterprise')) DEFAULT 'basic',
  phone_number TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  stripe_customer_id TEXT
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can access own data" ON users
  FOR ALL USING (auth.uid() = id);
```

### 2. Phone Numbers Table
Twilio phone numbers assigned to users.

```sql
CREATE TABLE phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  twilio_phone_number TEXT NOT NULL,
  twilio_phone_sid TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;

-- Users can only access their own phone numbers
CREATE POLICY "Users can access own phone numbers" ON phone_numbers
  FOR ALL USING (auth.uid() = user_id);
```

### 3. Calls Table
Stores all call records with metadata and processing status.

```sql
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone_number_id UUID REFERENCES phone_numbers(id),
  twilio_call_sid TEXT UNIQUE NOT NULL,
  caller_number TEXT NOT NULL,
  caller_name TEXT,
  call_status TEXT CHECK (call_status IN ('ringing', 'in_progress', 'completed', 'busy', 'failed', 'no_answer', 'cancelled')),
  call_direction TEXT CHECK (call_direction IN ('inbound', 'outbound')),
  call_duration INTEGER, -- in seconds
  recording_url TEXT,
  recording_sid TEXT,
  transcription_text TEXT,
  transcription_confidence DECIMAL(3,2),
  ai_processing_status TEXT CHECK (ai_processing_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  main_topic TEXT, -- AI-extracted main topic for email subject
  call_summary TEXT,
  sentiment_analysis JSONB,
  urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'emergency')) DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  email_sent_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Users can only access their own calls
CREATE POLICY "Users can access own calls" ON calls
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX idx_calls_twilio_sid ON calls(twilio_call_sid);
CREATE INDEX idx_calls_processing_status ON calls(ai_processing_status);
```

### 4. Events Table (Core Feature)
Flexible events extracted from calls - supports all business types.

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('service_call', 'meeting', 'appointment', 'demo', 'follow_up', 'quote', 'consultation', 'inspection', 'emergency')) DEFAULT 'meeting',
  status TEXT CHECK (status IN ('extracted', 'pending', 'confirmed', 'tentative', 'completed', 'cancelled')) DEFAULT 'extracted',
  title TEXT NOT NULL,
  description TEXT,
  proposed_datetime TIMESTAMPTZ,
  confirmed_datetime TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  location_type TEXT CHECK (location_type IN ('address', 'virtual', 'phone', 'tbd')) DEFAULT 'tbd',
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  price_estimate DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'emergency')) DEFAULT 'medium',
  notes TEXT,
  ai_confidence DECIMAL(3,2), -- AI extraction confidence
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_reason TEXT,
  calendar_synced BOOLEAN DEFAULT false,
  calendar_event_id TEXT,
  confirmation_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Users can only access their own events
CREATE POLICY "Users can access own events" ON events
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_call_id ON events(call_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_proposed_datetime ON events(proposed_datetime);
CREATE INDEX idx_events_confirmed_datetime ON events(confirmed_datetime);
CREATE INDEX idx_events_event_type ON events(event_type);
```

### 5. Calendar Integrations Table
Store user calendar integration settings.

```sql
CREATE TABLE calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  integration_type TEXT CHECK (integration_type IN ('google', 'outlook', 'apple', 'other')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  access_token TEXT, -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_expires_at TIMESTAMPTZ,
  calendar_id TEXT,
  calendar_name TEXT,
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own integrations
CREATE POLICY "Users can access own integrations" ON calendar_integrations
  FOR ALL USING (auth.uid() = user_id);
```

### 6. Email Templates Table
Industry-specific email template configurations.

```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  industry_type TEXT,
  event_type TEXT,
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  variables JSONB, -- Template variables and their defaults
  styling JSONB, -- Custom styling options
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Users can access their own templates + public defaults
CREATE POLICY "Users can access own templates" ON email_templates
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
```

### 7. Communication Logs Table
Track all outbound communications (emails, SMS, calls).

```sql
CREATE TABLE communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  communication_type TEXT CHECK (communication_type IN ('email', 'sms', 'call')) NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  status TEXT CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')) DEFAULT 'pending',
  external_id TEXT, -- Provider ID (Resend, Twilio, etc.)
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own communications
CREATE POLICY "Users can access own communications" ON communication_logs
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_communication_logs_user_id ON communication_logs(user_id);
CREATE INDEX idx_communication_logs_event_id ON communication_logs(event_id);
CREATE INDEX idx_communication_logs_status ON communication_logs(status);
```

### 8. Industry Configurations Table
Store industry-specific settings and customizations.

```sql
CREATE TABLE industry_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  industry_type TEXT NOT NULL,
  event_types JSONB NOT NULL, -- Allowed event types for this industry
  terminology JSONB, -- Custom terminology (e.g., "appointment" vs "service call")
  default_duration_minutes INTEGER DEFAULT 60,
  business_hours JSONB, -- Operating hours
  pricing_enabled BOOLEAN DEFAULT false,
  location_required BOOLEAN DEFAULT true,
  auto_confirm_enabled BOOLEAN DEFAULT false,
  reminder_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE industry_configurations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own configurations
CREATE POLICY "Users can access own configurations" ON industry_configurations
  FOR ALL USING (auth.uid() = user_id);
```

### 9. Audit Logs Table
Track important system events and user actions.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT, -- 'call', 'event', 'user', etc.
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own audit logs
CREATE POLICY "Users can access own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

## Database Functions

### Update Timestamp Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_calls_updated_at BEFORE UPDATE ON calls FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_calendar_integrations_updated_at BEFORE UPDATE ON calendar_integrations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_industry_configurations_updated_at BEFORE UPDATE ON industry_configurations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_phone_numbers_updated_at BEFORE UPDATE ON phone_numbers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

### Event Statistics Function
```sql
CREATE OR REPLACE FUNCTION get_user_event_stats(user_uuid UUID)
RETURNS TABLE (
  total_events BIGINT,
  pending_events BIGINT,
  confirmed_events BIGINT,
  completed_events BIGINT,
  conversion_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_events,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_events,
    COUNT(*) FILTER (WHERE status = 'confirmed')::BIGINT as confirmed_events,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_events,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND(COUNT(*) FILTER (WHERE status IN ('confirmed', 'completed'))::DECIMAL / COUNT(*)::DECIMAL * 100, 2)
      ELSE 0
    END as conversion_rate
  FROM events 
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Initial Data Setup

### Default Industry Configurations
```sql
-- Insert default industry configurations
INSERT INTO industry_configurations (id, user_id, industry_type, event_types, terminology, default_duration_minutes, business_hours, pricing_enabled, location_required) VALUES
(gen_random_uuid(), NULL, 'plumbing', 
 '["service_call", "quote", "emergency", "follow_up"]', 
 '{"appointment": "service call", "meeting": "site visit", "demo": "quote"}',
 90, '{"monday": {"start": "08:00", "end": "17:00"}, "saturday": {"start": "09:00", "end": "15:00"}}', 
 true, true),
(gen_random_uuid(), NULL, 'real_estate', 
 '["meeting", "inspection", "appointment", "follow_up"]', 
 '{"service_call": "property showing", "meeting": "client meeting"}',
 60, '{"monday": {"start": "09:00", "end": "18:00"}, "sunday": {"start": "12:00", "end": "17:00"}}', 
 false, true),
(gen_random_uuid(), NULL, 'legal', 
 '["consultation", "meeting", "appointment"]', 
 '{"service_call": "consultation", "demo": "case review"}',
 60, '{"monday": {"start": "09:00", "end": "17:00"}}', 
 true, false),
(gen_random_uuid(), NULL, 'medical', 
 '["appointment", "consultation", "follow_up", "emergency"]', 
 '{"meeting": "appointment", "service_call": "consultation"}',
 30, '{"monday": {"start": "08:00", "end": "17:00"}}', 
 false, true),
(gen_random_uuid(), NULL, 'sales', 
 '["demo", "meeting", "follow_up", "consultation"]', 
 '{"service_call": "demo", "appointment": "sales meeting"}',
 45, '{"monday": {"start": "09:00", "end": "17:00"}}', 
 false, false);
```

### Default Email Templates
```sql
-- Insert default email templates
INSERT INTO email_templates (id, user_id, template_name, industry_type, event_type, subject_template, body_template, is_default, variables) VALUES
(gen_random_uuid(), NULL, 'Service Call Overview', 'plumbing', 'service_call', 
 'Service Call Request - {{customer_name}} - {{event_date}}',
 'Hi, I received your call about {{main_topic}}. I have scheduled a {{event_type}} for {{event_datetime}} at {{location}}. Please confirm if this works for you.',
 true, '{"customer_name": "", "main_topic": "", "event_type": "", "event_datetime": "", "location": ""}'),
(gen_random_uuid(), NULL, 'Property Showing', 'real_estate', 'meeting',
 'Property Showing - {{location}} - {{event_date}}', 
 'Thank you for your interest in {{location}}. I have scheduled a showing for {{event_datetime}}. Looking forward to meeting you!',
 true, '{"location": "", "event_datetime": ""}');
```

## Performance Considerations

### Database Optimization
- **Indexes**: Created on frequently queried columns (user_id, created_at, status)
- **Partitioning**: Consider partitioning calls table by date for high volume
- **Archiving**: Archive completed calls older than 2 years
- **Connection Pooling**: Use Supabase connection pooling for production

### Monitoring Queries
```sql
-- Monitor database performance
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename IN ('calls', 'events', 'users');

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

## Security Considerations

1. **Row Level Security**: Enabled on all tables with user-specific policies
2. **API Keys**: Store encrypted in separate secure service
3. **PII Data**: Encrypt customer_phone and customer_email fields
4. **Audit Trail**: All data modifications logged in audit_logs
5. **Backup Strategy**: Daily backups with 30-day retention

## Migration Strategy

### Version 1.0 → 2.0 Migration
```sql
-- Add new columns to existing tables
ALTER TABLE events ADD COLUMN ai_confidence DECIMAL(3,2);
ALTER TABLE events ADD COLUMN follow_up_required BOOLEAN DEFAULT false;
ALTER TABLE calls ADD COLUMN urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'emergency')) DEFAULT 'medium';

-- Update existing data with defaults
UPDATE events SET ai_confidence = 0.85 WHERE ai_confidence IS NULL;
UPDATE events SET follow_up_required = false WHERE follow_up_required IS NULL;
```

## Supabase Configuration

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Realtime Configuration
Enable realtime for tables that need live updates:
```sql
-- Enable realtime for events table
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE calls;
```

This database schema provides a solid foundation for the Flynn.ai v2 platform with flexibility for multiple industries while maintaining performance and security.