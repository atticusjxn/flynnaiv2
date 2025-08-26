-- Flynn.ai v2 Initial Data Setup
-- Migration: 002_initial_data.sql
-- Created: 2024-08-26

-- =============================================================================
-- DEFAULT INDUSTRY CONFIGURATIONS
-- =============================================================================

-- Insert default industry configurations (user_id = NULL means global defaults)
INSERT INTO industry_configurations (id, user_id, industry_type, event_types, terminology, default_duration_minutes, business_hours, pricing_enabled, location_required) VALUES
(gen_random_uuid(), NULL, 'plumbing', 
 '["service_call", "quote", "emergency", "follow_up"]'::jsonb, 
 '{"appointment": "service call", "meeting": "site visit", "demo": "quote"}'::jsonb,
 90, 
 '{"monday": {"start": "08:00", "end": "17:00"}, "tuesday": {"start": "08:00", "end": "17:00"}, "wednesday": {"start": "08:00", "end": "17:00"}, "thursday": {"start": "08:00", "end": "17:00"}, "friday": {"start": "08:00", "end": "17:00"}, "saturday": {"start": "09:00", "end": "15:00"}}'::jsonb, 
 true, true),

(gen_random_uuid(), NULL, 'real_estate', 
 '["meeting", "inspection", "appointment", "follow_up"]'::jsonb, 
 '{"service_call": "property showing", "meeting": "client meeting"}'::jsonb,
 60, 
 '{"monday": {"start": "09:00", "end": "18:00"}, "tuesday": {"start": "09:00", "end": "18:00"}, "wednesday": {"start": "09:00", "end": "18:00"}, "thursday": {"start": "09:00", "end": "18:00"}, "friday": {"start": "09:00", "end": "18:00"}, "saturday": {"start": "10:00", "end": "16:00"}, "sunday": {"start": "12:00", "end": "17:00"}}'::jsonb, 
 false, true),

(gen_random_uuid(), NULL, 'legal', 
 '["consultation", "meeting", "appointment"]'::jsonb, 
 '{"service_call": "consultation", "demo": "case review"}'::jsonb,
 60, 
 '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "17:00"}}'::jsonb, 
 true, false),

(gen_random_uuid(), NULL, 'medical', 
 '["appointment", "consultation", "follow_up", "emergency"]'::jsonb, 
 '{"meeting": "appointment", "service_call": "consultation"}'::jsonb,
 30, 
 '{"monday": {"start": "08:00", "end": "17:00"}, "tuesday": {"start": "08:00", "end": "17:00"}, "wednesday": {"start": "08:00", "end": "17:00"}, "thursday": {"start": "08:00", "end": "17:00"}, "friday": {"start": "08:00", "end": "17:00"}}'::jsonb, 
 false, true),

(gen_random_uuid(), NULL, 'sales', 
 '["demo", "meeting", "follow_up", "consultation"]'::jsonb, 
 '{"service_call": "demo", "appointment": "sales meeting"}'::jsonb,
 45, 
 '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "17:00"}}'::jsonb, 
 false, false),

(gen_random_uuid(), NULL, 'consulting', 
 '["consultation", "meeting", "workshop", "follow_up"]'::jsonb, 
 '{"service_call": "consultation", "appointment": "client meeting"}'::jsonb,
 90, 
 '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "17:00"}}'::jsonb, 
 true, false),

(gen_random_uuid(), NULL, 'general_services', 
 '["meeting", "appointment", "follow_up", "consultation"]'::jsonb, 
 '{"service_call": "appointment", "meeting": "meeting"}'::jsonb,
 60, 
 '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "17:00"}}'::jsonb, 
 false, false);

-- =============================================================================
-- DEFAULT EMAIL TEMPLATES
-- =============================================================================

-- Insert default email templates (user_id = NULL means global defaults)
INSERT INTO email_templates (id, user_id, template_name, industry_type, event_type, subject_template, body_template, is_default, variables) VALUES
(gen_random_uuid(), NULL, 'Service Call Overview', 'plumbing', 'service_call', 
 'Service Request - {{customer_name}} - {{event_date}}',
 'Hi there,

I received your call about {{main_topic}}. Based on our conversation, I''ve noted the following:

**Service Details:**
- Service Type: {{event_type}}
- Proposed Time: {{event_datetime}}
- Location: {{location}}
{{#if price_estimate}}
- Estimated Cost: {{price_estimate}}
{{/if}}

Please reply to confirm this appointment time or let me know if you need to reschedule.

Best regards,
{{company_name}}',
 true, 
 '{"customer_name": "", "main_topic": "", "event_type": "", "event_datetime": "", "location": "", "price_estimate": "", "company_name": ""}'::jsonb),

(gen_random_uuid(), NULL, 'Property Showing', 'real_estate', 'meeting',
 'Property Showing - {{location}} - {{event_date}}', 
 'Hi {{customer_name}},

Thank you for your interest in the property at {{location}}. 

I''ve scheduled a showing for:
- **Date & Time:** {{event_datetime}}
- **Property:** {{location}}
- **Duration:** Approximately {{duration_minutes}} minutes

Please let me know if this time works for you, or if you''d prefer a different time.

Looking forward to showing you this property!

Best regards,
{{agent_name}}
{{company_name}}',
 true, 
 '{"customer_name": "", "location": "", "event_datetime": "", "duration_minutes": "60", "agent_name": "", "company_name": ""}'::jsonb),

(gen_random_uuid(), NULL, 'Legal Consultation', 'legal', 'consultation',
 'Consultation Appointment - {{customer_name}} - {{event_date}}',
 'Dear {{customer_name}},

Thank you for contacting our office regarding {{main_topic}}.

I''ve scheduled a consultation for:
- **Date & Time:** {{event_datetime}}
- **Duration:** {{duration_minutes}} minutes
- **Type:** {{event_type}}

Please bring any relevant documents related to your case.

{{#if price_estimate}}
**Consultation Fee:** {{price_estimate}}
{{/if}}

Please confirm your attendance or let me know if you need to reschedule.

Sincerely,
{{attorney_name}}
{{firm_name}}',
 true,
 '{"customer_name": "", "main_topic": "", "event_datetime": "", "duration_minutes": "60", "event_type": "", "price_estimate": "", "attorney_name": "", "firm_name": ""}'::jsonb),

(gen_random_uuid(), NULL, 'Medical Appointment', 'medical', 'appointment',
 'Appointment Confirmation - {{customer_name}} - {{event_date}}',
 'Dear {{customer_name}},

Your appointment has been scheduled:

**Appointment Details:**
- Date & Time: {{event_datetime}}
- Duration: {{duration_minutes}} minutes
- Location: {{location}}
- Reason: {{main_topic}}

**Important Reminders:**
- Please arrive 15 minutes early
- Bring your insurance card and ID
- Bring a list of current medications

If you need to reschedule or have any questions, please call our office.

Thank you,
{{practice_name}}',
 true,
 '{"customer_name": "", "event_datetime": "", "duration_minutes": "30", "location": "", "main_topic": "", "practice_name": ""}'::jsonb),

(gen_random_uuid(), NULL, 'Sales Demo', 'sales', 'demo',
 'Product Demo - {{customer_name}} - {{event_date}}',
 'Hi {{customer_name}},

Great speaking with you today about {{main_topic}}!

I''ve scheduled our product demonstration:
- **Date & Time:** {{event_datetime}}
- **Duration:** {{duration_minutes}} minutes
- **Format:** {{location_type}}
{{#if location}}
- **Location:** {{location}}
{{/if}}

During this demo, we''ll cover:
- How our solution addresses your specific needs
- Live demonstration of key features
- Pricing and implementation timeline
- Q&A session

Looking forward to showing you how we can help your business!

Best regards,
{{sales_rep_name}}
{{company_name}}',
 true,
 '{"customer_name": "", "main_topic": "", "event_datetime": "", "duration_minutes": "45", "location_type": "virtual", "location": "", "sales_rep_name": "", "company_name": ""}'::jsonb);

-- =============================================================================
-- ENABLE REALTIME FOR CORE TABLES
-- =============================================================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE calls;
ALTER PUBLICATION supabase_realtime ADD TABLE communication_logs;