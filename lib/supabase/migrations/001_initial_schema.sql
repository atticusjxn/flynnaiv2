-- Flynn.ai v2 Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Created: 2024-08-26

-- =============================================================================
-- 1. USERS TABLE
-- =============================================================================

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

-- =============================================================================
-- 2. PHONE NUMBERS TABLE
-- =============================================================================

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

-- =============================================================================
-- 3. CALLS TABLE
-- =============================================================================

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

-- =============================================================================
-- 4. EVENTS TABLE (CORE FEATURE)
-- =============================================================================

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

-- =============================================================================
-- 5. CALENDAR INTEGRATIONS TABLE
-- =============================================================================

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

-- =============================================================================
-- 6. EMAIL TEMPLATES TABLE
-- =============================================================================

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

-- =============================================================================
-- 7. COMMUNICATION LOGS TABLE
-- =============================================================================

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

-- =============================================================================
-- 8. INDUSTRY CONFIGURATIONS TABLE
-- =============================================================================

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

-- =============================================================================
-- 9. AUDIT LOGS TABLE
-- =============================================================================

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

-- =============================================================================
-- DATABASE FUNCTIONS
-- =============================================================================

-- Update timestamp function
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

-- Event statistics function
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