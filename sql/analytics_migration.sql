-- Analytics System Migration for Flynn.ai v2
-- This migration adds comprehensive analytics tracking tables to support Task 39

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create analytics events table for event tracking
CREATE TABLE public.analytics_events (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    session_id text,
    event_type text NOT NULL CHECK (event_type IN ('page_view', 'feature_usage', 'api_call', 'conversion', 'churn_risk', 'support_interaction')),
    event_name text NOT NULL,
    properties jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
    ip_address inet,
    user_agent text
);

-- Create user metrics table for user-level analytics
CREATE TABLE public.user_metrics (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    total_calls integer DEFAULT 0,
    total_events integer DEFAULT 0,
    calls_this_month integer DEFAULT 0,
    events_this_month integer DEFAULT 0,
    last_call_date timestamp with time zone,
    last_login_date timestamp with time zone,
    total_revenue numeric(10,2) DEFAULT 0.00,
    customer_lifetime_value numeric(10,2) DEFAULT 0.00,
    subscription_start_date timestamp with time zone,
    churn_risk_score numeric(3,2) DEFAULT 0.00 CHECK (churn_risk_score >= 0 AND churn_risk_score <= 1),
    engagement_score numeric(3,2) DEFAULT 0.00 CHECK (engagement_score >= 0 AND engagement_score <= 1),
    created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- Create business metrics table for aggregate business analytics
CREATE TABLE public.business_metrics (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    metric_date date NOT NULL,
    total_users integer DEFAULT 0,
    active_users integer DEFAULT 0,
    new_signups integer DEFAULT 0,
    monthly_recurring_revenue numeric(12,2) DEFAULT 0.00,
    churn_rate numeric(5,4) DEFAULT 0.0000 CHECK (churn_rate >= 0 AND churn_rate <= 1),
    customer_lifetime_value numeric(10,2) DEFAULT 0.00,
    conversion_rate numeric(5,4) DEFAULT 0.0000 CHECK (conversion_rate >= 0 AND conversion_rate <= 1),
    total_calls integer DEFAULT 0,
    total_events integer DEFAULT 0,
    revenue_by_industry jsonb DEFAULT '{}',
    revenue_by_tier jsonb DEFAULT '{}',
    feature_usage_stats jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
    UNIQUE(metric_date)
);

-- Create indexes for performance
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);

CREATE INDEX idx_user_metrics_user_id ON public.user_metrics(user_id);
CREATE INDEX idx_user_metrics_last_call_date ON public.user_metrics(last_call_date);
CREATE INDEX idx_user_metrics_churn_risk_score ON public.user_metrics(churn_risk_score);
CREATE INDEX idx_user_metrics_updated_at ON public.user_metrics(updated_at);

CREATE INDEX idx_business_metrics_metric_date ON public.business_metrics(metric_date);
CREATE INDEX idx_business_metrics_created_at ON public.business_metrics(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_user_metrics_updated_at 
    BEFORE UPDATE ON public.user_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_metrics_updated_at 
    BEFORE UPDATE ON public.business_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events
CREATE POLICY "Users can view own analytics events" ON public.analytics_events
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can insert own analytics events" ON public.analytics_events
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

-- RLS Policies for user_metrics
CREATE POLICY "Users can view own metrics" ON public.user_metrics
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can update own metrics" ON public.user_metrics
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "System can insert user metrics" ON public.user_metrics
    FOR INSERT WITH CHECK (true);

-- RLS Policies for business_metrics (admin only)
CREATE POLICY "Admins can view business metrics" ON public.business_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can manage business metrics" ON public.business_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Insert sample data for demonstration (optional - remove for production)
INSERT INTO public.business_metrics (
    metric_date,
    total_users,
    active_users,
    new_signups,
    monthly_recurring_revenue,
    churn_rate,
    customer_lifetime_value,
    conversion_rate,
    total_calls,
    total_events,
    revenue_by_industry,
    revenue_by_tier,
    feature_usage_stats
) VALUES 
-- Sample data for last 6 months
(CURRENT_DATE - INTERVAL '5 months', 100, 75, 25, 2500.00, 0.05, 125.00, 0.15, 350, 150, 
 '{"plumbing": 1000, "real_estate": 800, "legal": 500, "medical": 200}', 
 '{"basic": 1500, "professional": 750, "enterprise": 250}',
 '{"call_processing": 280, "calendar_sync": 180, "email_delivery": 340, "dashboard_usage": 220}'),

(CURRENT_DATE - INTERVAL '4 months', 125, 95, 30, 3200.00, 0.04, 140.00, 0.18, 450, 200, 
 '{"plumbing": 1300, "real_estate": 1000, "legal": 650, "medical": 250}', 
 '{"basic": 1900, "professional": 950, "enterprise": 350}',
 '{"call_processing": 360, "calendar_sync": 240, "email_delivery": 430, "dashboard_usage": 290}'),

(CURRENT_DATE - INTERVAL '3 months', 150, 115, 35, 4100.00, 0.035, 155.00, 0.22, 580, 260, 
 '{"plumbing": 1650, "real_estate": 1250, "legal": 850, "medical": 350}', 
 '{"basic": 2400, "professional": 1200, "enterprise": 500}',
 '{"call_processing": 470, "calendar_sync": 310, "email_delivery": 550, "dashboard_usage": 380}'),

(CURRENT_DATE - INTERVAL '2 months', 180, 140, 40, 5200.00, 0.03, 170.00, 0.25, 720, 320, 
 '{"plumbing": 2100, "real_estate": 1600, "legal": 1050, "medical": 450}', 
 '{"basic": 3000, "professional": 1500, "enterprise": 700}',
 '{"call_processing": 590, "calendar_sync": 390, "email_delivery": 680, "dashboard_usage": 480}'),

(CURRENT_DATE - INTERVAL '1 month', 210, 165, 45, 6500.00, 0.025, 185.00, 0.28, 880, 390, 
 '{"plumbing": 2600, "real_estate": 2000, "legal": 1300, "medical": 600}', 
 '{"basic": 3700, "professional": 1900, "enterprise": 900}',
 '{"call_processing": 730, "calendar_sync": 480, "email_delivery": 830, "dashboard_usage": 590}'),

(CURRENT_DATE, 240, 190, 50, 7800.00, 0.02, 200.00, 0.32, 1050, 470, 
 '{"plumbing": 3150, "real_estate": 2400, "legal": 1550, "medical": 700}', 
 '{"basic": 4400, "professional": 2200, "enterprise": 1200}',
 '{"call_processing": 880, "calendar_sync": 580, "email_delivery": 990, "dashboard_usage": 710}');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.analytics_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_metrics TO authenticated;  
GRANT SELECT ON public.business_metrics TO authenticated;

-- Grant additional permissions for service role (for background jobs)
GRANT ALL ON public.analytics_events TO service_role;
GRANT ALL ON public.user_metrics TO service_role;
GRANT ALL ON public.business_metrics TO service_role;

-- Create function to update user metrics automatically
CREATE OR REPLACE FUNCTION update_user_metrics_on_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_metrics (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    UPDATE public.user_metrics
    SET 
        updated_at = timezone('utc', now())
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update user metrics when analytics events are inserted
CREATE TRIGGER update_user_metrics_on_analytics_event
    AFTER INSERT ON public.analytics_events
    FOR EACH ROW 
    WHEN (NEW.user_id IS NOT NULL)
    EXECUTE FUNCTION update_user_metrics_on_event();

COMMENT ON TABLE public.analytics_events IS 'Stores all user interaction events for analytics tracking';
COMMENT ON TABLE public.user_metrics IS 'Aggregated metrics per user for performance and analytics';
COMMENT ON TABLE public.business_metrics IS 'Daily business metrics and KPIs for dashboard analytics';

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';