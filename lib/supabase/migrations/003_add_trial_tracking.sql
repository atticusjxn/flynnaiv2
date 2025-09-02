-- Flynn.ai v2 Trial Tracking Migration
-- Migration: 003_add_trial_tracking.sql  
-- Created: 2024-08-31
-- Purpose: Add trial tracking fields for Australian billing system

-- =============================================================================
-- 1. UPDATE USERS TABLE FOR TRIAL TRACKING
-- =============================================================================

-- Add trial tracking columns
ALTER TABLE users ADD COLUMN trial_start_date TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN trial_end_date TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN subscription_status TEXT CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled', 'incomplete')) DEFAULT 'trial';
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;

-- Update subscription_tier to include trial option
ALTER TABLE users DROP CONSTRAINT users_subscription_tier_check;
ALTER TABLE users ADD CONSTRAINT users_subscription_tier_check 
  CHECK (subscription_tier IN ('trial', 'basic', 'professional', 'enterprise'));

-- Set default subscription tier to trial for new users
ALTER TABLE users ALTER COLUMN subscription_tier SET DEFAULT 'trial';

-- =============================================================================
-- 2. INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index for finding users with expiring trials
CREATE INDEX idx_users_trial_end_date ON users(trial_end_date) WHERE subscription_status = 'trial';

-- Index for subscription management
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);

-- =============================================================================
-- 3. UPDATE EXISTING USERS TO HAVE TRIAL STATUS
-- =============================================================================

-- Set existing users to have completed trials (grandfathered in)
UPDATE users 
SET 
  subscription_status = 'active',
  subscription_tier = 'basic',
  trial_start_date = created_at,
  trial_end_date = created_at + INTERVAL '30 days'
WHERE subscription_status IS NULL OR subscription_tier = 'basic';

-- =============================================================================
-- 4. FUNCTIONS FOR TRIAL MANAGEMENT
-- =============================================================================

-- Function to check if user's trial has expired
CREATE OR REPLACE FUNCTION is_trial_expired(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND subscription_status = 'trial' 
    AND trial_end_date < NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get days remaining in trial
CREATE OR REPLACE FUNCTION get_trial_days_remaining(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT 
      CASE 
        WHEN subscription_status != 'trial' THEN 0
        WHEN trial_end_date IS NULL THEN 0
        ELSE GREATEST(0, EXTRACT(days FROM (trial_end_date - NOW()))::INTEGER)
      END
    FROM users 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 5. RLS POLICIES REMAIN UNCHANGED
-- =============================================================================
-- The existing RLS policies on users table will continue to work
-- as they're based on the user ID which hasn't changed

-- =============================================================================
-- 6. COMMENT DOCUMENTATION
-- =============================================================================

COMMENT ON COLUMN users.trial_start_date IS 'When the user started their free trial';
COMMENT ON COLUMN users.trial_end_date IS 'When the users free trial expires';  
COMMENT ON COLUMN users.subscription_status IS 'Current subscription status: trial, active, past_due, cancelled, incomplete';
COMMENT ON COLUMN users.stripe_subscription_id IS 'Stripe subscription ID for active subscriptions';
COMMENT ON FUNCTION is_trial_expired(UUID) IS 'Check if users trial period has expired';
COMMENT ON FUNCTION get_trial_days_remaining(UUID) IS 'Get number of days remaining in trial period';