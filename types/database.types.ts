// Flynn.ai v2 - Database Types
// Generated types for Supabase database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          metadata: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          resource_type?: string | null;
          resource_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      calendar_integrations: {
        Row: {
          id: string;
          user_id: string;
          integration_type: 'google' | 'outlook' | 'apple' | 'other';
          is_active: boolean | null;
          access_token: string | null;
          refresh_token: string | null;
          token_expires_at: string | null;
          calendar_id: string | null;
          calendar_name: string | null;
          sync_enabled: boolean | null;
          last_sync_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          integration_type: 'google' | 'outlook' | 'apple' | 'other';
          is_active?: boolean | null;
          access_token?: string | null;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          calendar_id?: string | null;
          calendar_name?: string | null;
          sync_enabled?: boolean | null;
          last_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          integration_type?: 'google' | 'outlook' | 'apple' | 'other';
          is_active?: boolean | null;
          access_token?: string | null;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          calendar_id?: string | null;
          calendar_name?: string | null;
          sync_enabled?: boolean | null;
          last_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      calls: {
        Row: {
          id: string;
          user_id: string;
          phone_number_id: string | null;
          twilio_call_sid: string;
          caller_number: string;
          caller_name: string | null;
          call_status: 'ringing' | 'in_progress' | 'completed' | 'busy' | 'failed' | 'no_answer' | 'cancelled' | null;
          call_direction: 'inbound' | 'outbound' | null;
          call_duration: number | null;
          recording_url: string | null;
          recording_sid: string | null;
          transcription_text: string | null;
          transcription_confidence: number | null;
          ai_processing_status: 'pending' | 'processing' | 'completed' | 'failed' | null;
          main_topic: string | null;
          call_summary: string | null;
          sentiment_analysis: Json | null;
          urgency_level: 'low' | 'medium' | 'high' | 'emergency' | null;
          created_at: string;
          updated_at: string;
          processed_at: string | null;
          email_sent_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          phone_number_id?: string | null;
          twilio_call_sid: string;
          caller_number: string;
          caller_name?: string | null;
          call_status?: 'ringing' | 'in_progress' | 'completed' | 'busy' | 'failed' | 'no_answer' | 'cancelled' | null;
          call_direction?: 'inbound' | 'outbound' | null;
          call_duration?: number | null;
          recording_url?: string | null;
          recording_sid?: string | null;
          transcription_text?: string | null;
          transcription_confidence?: number | null;
          ai_processing_status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
          main_topic?: string | null;
          call_summary?: string | null;
          sentiment_analysis?: Json | null;
          urgency_level?: 'low' | 'medium' | 'high' | 'emergency' | null;
          created_at?: string;
          updated_at?: string;
          processed_at?: string | null;
          email_sent_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          phone_number_id?: string | null;
          twilio_call_sid?: string;
          caller_number?: string;
          caller_name?: string | null;
          call_status?: 'ringing' | 'in_progress' | 'completed' | 'busy' | 'failed' | 'no_answer' | 'cancelled' | null;
          call_direction?: 'inbound' | 'outbound' | null;
          call_duration?: number | null;
          recording_url?: string | null;
          recording_sid?: string | null;
          transcription_text?: string | null;
          transcription_confidence?: number | null;
          ai_processing_status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
          main_topic?: string | null;
          call_summary?: string | null;
          sentiment_analysis?: Json | null;
          urgency_level?: 'low' | 'medium' | 'high' | 'emergency' | null;
          created_at?: string;
          updated_at?: string;
          processed_at?: string | null;
          email_sent_at?: string | null;
        };
      };
      communication_logs: {
        Row: {
          id: string;
          user_id: string;
          event_id: string | null;
          call_id: string | null;
          communication_type: 'email' | 'sms' | 'call';
          recipient: string;
          subject: string | null;
          content: string | null;
          status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | null;
          external_id: string | null;
          error_message: string | null;
          sent_at: string | null;
          delivered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id?: string | null;
          call_id?: string | null;
          communication_type: 'email' | 'sms' | 'call';
          recipient: string;
          subject?: string | null;
          content?: string | null;
          status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | null;
          external_id?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string | null;
          call_id?: string | null;
          communication_type?: 'email' | 'sms' | 'call';
          recipient?: string;
          subject?: string | null;
          content?: string | null;
          status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | null;
          external_id?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
        };
      };
      email_templates: {
        Row: {
          id: string;
          user_id: string | null;
          template_name: string;
          industry_type: string | null;
          event_type: string | null;
          subject_template: string;
          body_template: string;
          is_active: boolean | null;
          is_default: boolean | null;
          variables: Json | null;
          styling: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          template_name: string;
          industry_type?: string | null;
          event_type?: string | null;
          subject_template: string;
          body_template: string;
          is_active?: boolean | null;
          is_default?: boolean | null;
          variables?: Json | null;
          styling?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          template_name?: string;
          industry_type?: string | null;
          event_type?: string | null;
          subject_template?: string;
          body_template?: string;
          is_active?: boolean | null;
          is_default?: boolean | null;
          variables?: Json | null;
          styling?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          call_id: string;
          user_id: string;
          event_type: 'service_call' | 'meeting' | 'appointment' | 'demo' | 'follow_up' | 'quote' | 'consultation' | 'inspection' | 'emergency' | null;
          status: 'extracted' | 'pending' | 'confirmed' | 'tentative' | 'completed' | 'cancelled' | null;
          title: string;
          description: string | null;
          proposed_datetime: string | null;
          confirmed_datetime: string | null;
          duration_minutes: number | null;
          location: string | null;
          location_type: 'address' | 'virtual' | 'phone' | 'tbd' | null;
          customer_name: string | null;
          customer_phone: string | null;
          customer_email: string | null;
          price_estimate: number | null;
          currency: string | null;
          urgency_level: 'low' | 'medium' | 'high' | 'emergency' | null;
          notes: string | null;
          ai_confidence: number | null;
          follow_up_required: boolean | null;
          follow_up_reason: string | null;
          calendar_synced: boolean | null;
          calendar_event_id: string | null;
          confirmation_sent_at: string | null;
          reminder_sent_at: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          call_id: string;
          user_id: string;
          event_type?: 'service_call' | 'meeting' | 'appointment' | 'demo' | 'follow_up' | 'quote' | 'consultation' | 'inspection' | 'emergency' | null;
          status?: 'extracted' | 'pending' | 'confirmed' | 'tentative' | 'completed' | 'cancelled' | null;
          title: string;
          description?: string | null;
          proposed_datetime?: string | null;
          confirmed_datetime?: string | null;
          duration_minutes?: number | null;
          location?: string | null;
          location_type?: 'address' | 'virtual' | 'phone' | 'tbd' | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          price_estimate?: number | null;
          currency?: string | null;
          urgency_level?: 'low' | 'medium' | 'high' | 'emergency' | null;
          notes?: string | null;
          ai_confidence?: number | null;
          follow_up_required?: boolean | null;
          follow_up_reason?: string | null;
          calendar_synced?: boolean | null;
          calendar_event_id?: string | null;
          confirmation_sent_at?: string | null;
          reminder_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          call_id?: string;
          user_id?: string;
          event_type?: 'service_call' | 'meeting' | 'appointment' | 'demo' | 'follow_up' | 'quote' | 'consultation' | 'inspection' | 'emergency' | null;
          status?: 'extracted' | 'pending' | 'confirmed' | 'tentative' | 'completed' | 'cancelled' | null;
          title?: string;
          description?: string | null;
          proposed_datetime?: string | null;
          confirmed_datetime?: string | null;
          duration_minutes?: number | null;
          location?: string | null;
          location_type?: 'address' | 'virtual' | 'phone' | 'tbd' | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          price_estimate?: number | null;
          currency?: string | null;
          urgency_level?: 'low' | 'medium' | 'high' | 'emergency' | null;
          notes?: string | null;
          ai_confidence?: number | null;
          follow_up_required?: boolean | null;
          follow_up_reason?: string | null;
          calendar_synced?: boolean | null;
          calendar_event_id?: string | null;
          confirmation_sent_at?: string | null;
          reminder_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      industry_configurations: {
        Row: {
          id: string;
          user_id: string | null;
          industry_type: string;
          event_types: Json;
          terminology: Json | null;
          default_duration_minutes: number | null;
          business_hours: Json | null;
          pricing_enabled: boolean | null;
          location_required: boolean | null;
          auto_confirm_enabled: boolean | null;
          reminder_settings: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          industry_type: string;
          event_types: Json;
          terminology?: Json | null;
          default_duration_minutes?: number | null;
          business_hours?: Json | null;
          pricing_enabled?: boolean | null;
          location_required?: boolean | null;
          auto_confirm_enabled?: boolean | null;
          reminder_settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          industry_type?: string;
          event_types?: Json;
          terminology?: Json | null;
          default_duration_minutes?: number | null;
          business_hours?: Json | null;
          pricing_enabled?: boolean | null;
          location_required?: boolean | null;
          auto_confirm_enabled?: boolean | null;
          reminder_settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      phone_numbers: {
        Row: {
          id: string;
          user_id: string;
          twilio_phone_number: string;
          twilio_phone_sid: string;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          twilio_phone_number: string;
          twilio_phone_sid: string;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          twilio_phone_number?: string;
          twilio_phone_sid?: string;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company_name: string | null;
          industry_type: 'plumbing' | 'real_estate' | 'legal' | 'medical' | 'sales' | 'consulting' | 'general_services' | 'other' | null;
          subscription_tier: 'trial' | 'basic' | 'professional' | 'enterprise' | null;
          subscription_status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'incomplete' | null;
          trial_start_date: string | null;
          trial_end_date: string | null;
          stripe_subscription_id: string | null;
          phone_number: string | null;
          timezone: string | null;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
          is_active: boolean | null;
          settings: Json | null;
          stripe_customer_id: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          company_name?: string | null;
          industry_type?: 'plumbing' | 'real_estate' | 'legal' | 'medical' | 'sales' | 'consulting' | 'general_services' | 'other' | null;
          subscription_tier?: 'trial' | 'basic' | 'professional' | 'enterprise' | null;
          subscription_status?: 'trial' | 'active' | 'past_due' | 'cancelled' | 'incomplete' | null;
          trial_start_date?: string | null;
          trial_end_date?: string | null;
          stripe_subscription_id?: string | null;
          phone_number?: string | null;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
          is_active?: boolean | null;
          settings?: Json | null;
          stripe_customer_id?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          company_name?: string | null;
          industry_type?: 'plumbing' | 'real_estate' | 'legal' | 'medical' | 'sales' | 'consulting' | 'general_services' | 'other' | null;
          subscription_tier?: 'trial' | 'basic' | 'professional' | 'enterprise' | null;
          subscription_status?: 'trial' | 'active' | 'past_due' | 'cancelled' | 'incomplete' | null;
          trial_start_date?: string | null;
          trial_end_date?: string | null;
          stripe_subscription_id?: string | null;
          phone_number?: string | null;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
          is_active?: boolean | null;
          settings?: Json | null;
          stripe_customer_id?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_event_stats: {
        Args: {
          user_uuid: string;
        };
        Returns: {
          total_events: number;
          pending_events: number;
          confirmed_events: number;
          completed_events: number;
          conversion_rate: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}