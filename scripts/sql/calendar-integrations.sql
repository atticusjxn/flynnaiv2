-- Calendar Integrations and Event Mapping Tables for Flynn.ai v2

-- Calendar integrations table to store OAuth tokens and connection info
CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'apple', 'ical')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT NOT NULL DEFAULT 'Bearer',
  scope TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  calendar_count INTEGER DEFAULT 0,
  default_calendar_id TEXT,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one active integration per provider per user
  UNIQUE(user_id, provider, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Calendar event mappings to track Flynn events synced to external calendars
CREATE TABLE IF NOT EXISTS calendar_event_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flynn_event_id UUID NOT NULL, -- This will reference events table when created
  calendar_integration_id UUID NOT NULL REFERENCES calendar_integrations(id) ON DELETE CASCADE,
  external_event_id TEXT NOT NULL, -- Event ID in the external calendar system
  calendar_id TEXT NOT NULL, -- Which calendar in the external system
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed', 'cancelled')),
  sync_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ,
  
  -- Ensure unique mapping per Flynn event per calendar integration
  UNIQUE(flynn_event_id, calendar_integration_id)
);

-- User calendar sync preferences
CREATE TABLE IF NOT EXISTS calendar_sync_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  auto_sync_enabled BOOLEAN NOT NULL DEFAULT false,
  default_calendar_integration_id UUID REFERENCES calendar_integrations(id) ON DELETE SET NULL,
  default_calendar_id TEXT, -- Specific calendar within the integration
  default_duration_minutes INTEGER NOT NULL DEFAULT 60,
  include_customer_details BOOLEAN NOT NULL DEFAULT true,
  add_flynn_branding BOOLEAN NOT NULL DEFAULT true,
  email_reminder_minutes INTEGER DEFAULT 15,
  popup_reminder_minutes INTEGER DEFAULT 15,
  conflict_resolution TEXT NOT NULL DEFAULT 'ask' CHECK (conflict_resolution IN ('ask', 'skip', 'auto_reschedule')),
  sync_urgency_levels TEXT[] NOT NULL DEFAULT ARRAY['medium', 'high', 'emergency'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_provider ON calendar_integrations(user_id, provider) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_expires_at ON calendar_integrations(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calendar_event_mappings_flynn_event ON calendar_event_mappings(flynn_event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_mappings_sync_status ON calendar_event_mappings(sync_status);
CREATE INDEX IF NOT EXISTS idx_calendar_event_mappings_user_id ON calendar_event_mappings(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_calendar_integrations_updated_at 
  BEFORE UPDATE ON calendar_integrations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_event_mappings_updated_at 
  BEFORE UPDATE ON calendar_event_mappings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_sync_preferences_updated_at 
  BEFORE UPDATE ON calendar_sync_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired integrations
CREATE OR REPLACE FUNCTION cleanup_expired_calendar_integrations()
RETURNS void AS $$
BEGIN
  UPDATE calendar_integrations 
  SET is_active = false, updated_at = NOW()
  WHERE expires_at < NOW() - INTERVAL '7 days'
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for security
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own calendar data
CREATE POLICY "Users can manage their own calendar integrations" ON calendar_integrations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own calendar event mappings" ON calendar_event_mappings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own calendar sync preferences" ON calendar_sync_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Insert default sync preferences for existing users
INSERT INTO calendar_sync_preferences (user_id)
SELECT id FROM users 
WHERE id NOT IN (SELECT user_id FROM calendar_sync_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON calendar_integrations TO authenticated;
GRANT ALL ON calendar_event_mappings TO authenticated;
GRANT ALL ON calendar_sync_preferences TO authenticated;

-- Comments for documentation
COMMENT ON TABLE calendar_integrations IS 'Stores OAuth tokens and connection info for external calendar providers';
COMMENT ON TABLE calendar_event_mappings IS 'Tracks Flynn events that have been synced to external calendars';
COMMENT ON TABLE calendar_sync_preferences IS 'User preferences for calendar synchronization behavior';

COMMENT ON COLUMN calendar_integrations.provider IS 'Calendar provider type: google, outlook, apple, ical';
COMMENT ON COLUMN calendar_integrations.scope IS 'OAuth scopes granted by the user';
COMMENT ON COLUMN calendar_integrations.expires_at IS 'When the access token expires';
COMMENT ON COLUMN calendar_event_mappings.sync_status IS 'Current sync status: pending, synced, failed, cancelled';
COMMENT ON COLUMN calendar_sync_preferences.sync_urgency_levels IS 'Which urgency levels to auto-sync to calendar';