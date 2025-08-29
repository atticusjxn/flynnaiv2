// Flynn.ai v2 - Automated Reminder Service
// Scheduled reminders for customer appointments

import { createClient } from '@/utils/supabase/server';
import { smsService } from './SMSService';
import { Database } from '@/types/database.types';
import { render } from '@react-email/render';
import CustomerReminderEmail from '@/components/email-templates/CustomerReminderEmail';
import { Resend } from 'resend';

type Event = Database['public']['Tables']['events']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type CommunicationLog = Database['public']['Tables']['communication_logs']['Insert'];

export interface ReminderConfig {
  emailEnabled: boolean;
  smsEnabled: boolean;
  reminderHours: number[]; // Hours before event to send reminders (e.g., [24, 2])
  onlyBusinessHours: boolean;
  timezone: string;
}

export interface ReminderJob {
  eventId: string;
  userId: string;
  reminderType: 'email' | 'sms' | 'both';
  scheduledFor: Date;
  hoursBeforeEvent: number;
}

export class ReminderService {
  private supabase = createClient();
  private resend = new Resend(process.env.RESEND_API_KEY);

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured - email reminders will be disabled');
    }
  }

  async scheduleEventReminders(eventId: string, userId: string, config?: ReminderConfig): Promise<{
    success: boolean;
    scheduledCount: number;
    error?: string;
  }> {
    try {
      // Get event details
      const { data: event, error: eventError } = await this.supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        return { success: false, scheduledCount: 0, error: 'Event not found' };
      }

      // Get user preferences and industry config
      const reminderConfig = await this.getReminderConfig(userId, config);

      // Calculate reminder times
      const reminderTimes = this.calculateReminderTimes(
        event.confirmed_datetime || event.proposed_datetime,
        reminderConfig
      );

      let scheduledCount = 0;

      // Schedule each reminder
      for (const reminderTime of reminderTimes) {
        if (reminderTime.scheduledFor > new Date()) {
          await this.scheduleReminder({
            eventId,
            userId,
            reminderType: this.getReminderType(event, reminderConfig),
            scheduledFor: reminderTime.scheduledFor,
            hoursBeforeEvent: reminderTime.hoursBeforeEvent
          });
          scheduledCount++;
        }
      }

      // Update event with reminder scheduled flag
      await this.supabase
        .from('events')
        .update({ reminder_sent_at: null }) // Reset flag for new reminders
        .eq('id', eventId);

      return { success: true, scheduledCount };

    } catch (error) {
      console.error('Error scheduling reminders:', error);
      return {
        success: false,
        scheduledCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async processScheduledReminders(): Promise<{
    processed: number;
    successful: number;
    failed: number;
  }> {
    let processed = 0;
    let successful = 0;
    let failed = 0;

    try {
      // This would typically be handled by a job queue like Bull/BullMQ
      // For now, we'll implement a simple cron-like check
      const upcomingEvents = await this.getEventsRequiringReminders();

      for (const event of upcomingEvents) {
        processed++;
        
        try {
          const reminderConfig = await this.getReminderConfig(event.user_id);
          const hoursUntilEvent = this.getHoursUntilEvent(event.confirmed_datetime || event.proposed_datetime);
          
          // Check if it's time to send reminder
          if (this.shouldSendReminder(hoursUntilEvent, reminderConfig.reminderHours)) {
            const result = await this.sendEventReminder(event, reminderConfig);
            
            if (result.success) {
              successful++;
              // Mark reminder as sent
              await this.supabase
                .from('events')
                .update({ reminder_sent_at: new Date().toISOString() })
                .eq('id', event.id);
            } else {
              failed++;
            }
          }
        } catch (error) {
          console.error(`Error processing reminder for event ${event.id}:`, error);
          failed++;
        }
      }

    } catch (error) {
      console.error('Error processing scheduled reminders:', error);
    }

    return { processed, successful, failed };
  }

  async sendEventReminder(event: Event, config: ReminderConfig): Promise<{
    success: boolean;
    emailSent?: boolean;
    smsSent?: boolean;
    error?: string;
  }> {
    const results = { success: false, emailSent: false, smsSent: false, error: '' };
    const hoursUntilEvent = this.getHoursUntilEvent(event.confirmed_datetime || event.proposed_datetime);

    try {
      // Get user details
      const { data: user } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', event.user_id)
        .single();

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Send email reminder
      if (config.emailEnabled && event.customer_email) {
        try {
          const emailResult = await this.sendEmailReminder(event, user, hoursUntilEvent);
          results.emailSent = emailResult.success;
          if (!emailResult.success) {
            results.error += `Email failed: ${emailResult.error}. `;
          }
        } catch (error) {
          results.error += `Email error: ${error instanceof Error ? error.message : 'Unknown'}. `;
        }
      }

      // Send SMS reminder
      if (config.smsEnabled && event.customer_phone) {
        try {
          const smsResult = await smsService.sendEventReminder(event, event.user_id, hoursUntilEvent);
          results.smsSent = smsResult.success;
          if (!smsResult.success) {
            results.error += `SMS failed: ${smsResult.error}. `;
          }
        } catch (error) {
          results.error += `SMS error: ${error instanceof Error ? error.message : 'Unknown'}. `;
        }
      }

      results.success = results.emailSent || results.smsSent;
      return results;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async sendEmailReminder(event: Event, user: User, hoursUntilEvent: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (!this.resend) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const emailHtml = render(CustomerReminderEmail({
        customerName: event.customer_name || 'Valued Customer',
        companyName: user.company_name || user.full_name || 'Your Service Provider',
        eventType: this.formatEventType(event.event_type),
        eventTitle: event.title,
        confirmedDateTime: event.confirmed_datetime || event.proposed_datetime || new Date().toISOString(),
        location: event.location,
        duration: event.duration_minutes || undefined,
        businessPhone: user.phone_number || undefined,
        businessEmail: user.email,
        hoursUntilEvent,
        specialInstructions: event.notes || undefined
      }));

      const emailResponse = await this.resend.emails.send({
        from: `${user.company_name || 'Flynn.ai'} <noreply@flynn.ai>`,
        to: [event.customer_email!],
        subject: `Reminder: ${event.title} ${hoursUntilEvent < 24 ? 'today' : 'coming up'}`,
        html: emailHtml,
      });

      // Log email communication
      await this.logCommunication({
        user_id: event.user_id,
        event_id: event.id,
        communication_type: 'email',
        recipient: event.customer_email!,
        subject: `Reminder: ${event.title}`,
        content: 'Appointment reminder email',
        status: 'sent',
        external_id: emailResponse.data?.id,
        sent_at: new Date().toISOString()
      });

      return { success: true };

    } catch (error) {
      console.error('Email reminder failed:', error);
      
      // Log failed email
      await this.logCommunication({
        user_id: event.user_id,
        event_id: event.id,
        communication_type: 'email',
        recipient: event.customer_email!,
        subject: `Reminder: ${event.title}`,
        content: 'Appointment reminder email',
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getReminderConfig(userId: string, override?: ReminderConfig): Promise<ReminderConfig> {
    if (override) return override;

    try {
      // Get user industry configuration
      const { data: industryConfig } = await this.supabase
        .from('industry_configurations')
        .select('reminder_settings')
        .eq('user_id', userId)
        .single();

      const settings = industryConfig?.reminder_settings as any;

      return {
        emailEnabled: settings?.emailEnabled ?? true,
        smsEnabled: settings?.smsEnabled ?? true,
        reminderHours: settings?.reminderHours ?? [24, 2], // 24 hours and 2 hours before
        onlyBusinessHours: settings?.onlyBusinessHours ?? false,
        timezone: settings?.timezone ?? 'America/New_York'
      };
    } catch (error) {
      // Return defaults if no config found
      return {
        emailEnabled: true,
        smsEnabled: true,
        reminderHours: [24, 2],
        onlyBusinessHours: false,
        timezone: 'America/New_York'
      };
    }
  }

  private calculateReminderTimes(eventDateTime: string | null, config: ReminderConfig): Array<{
    scheduledFor: Date;
    hoursBeforeEvent: number;
  }> {
    if (!eventDateTime) return [];

    const eventDate = new Date(eventDateTime);
    const reminderTimes: Array<{ scheduledFor: Date; hoursBeforeEvent: number }> = [];

    for (const hours of config.reminderHours) {
      const reminderTime = new Date(eventDate.getTime() - (hours * 60 * 60 * 1000));
      
      // Skip if reminder time is in the past
      if (reminderTime > new Date()) {
        reminderTimes.push({
          scheduledFor: reminderTime,
          hoursBeforeEvent: hours
        });
      }
    }

    return reminderTimes.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  }

  private getReminderType(event: Event, config: ReminderConfig): 'email' | 'sms' | 'both' {
    const hasEmail = !!event.customer_email && config.emailEnabled;
    const hasSMS = !!event.customer_phone && config.smsEnabled;

    if (hasEmail && hasSMS) return 'both';
    if (hasEmail) return 'email';
    if (hasSMS) return 'sms';
    return 'email'; // fallback
  }

  private async getEventsRequiringReminders(): Promise<Event[]> {
    try {
      // Get events that are confirmed and have datetime within next 48 hours
      // and haven't had reminders sent recently
      const twoDaysFromNow = new Date(Date.now() + (48 * 60 * 60 * 1000)).toISOString();
      const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000)).toISOString();

      const { data: events, error } = await this.supabase
        .from('events')
        .select('*')
        .eq('status', 'confirmed')
        .not('confirmed_datetime', 'is', null)
        .lt('confirmed_datetime', twoDaysFromNow)
        .gt('confirmed_datetime', new Date().toISOString())
        .or(`reminder_sent_at.is.null,reminder_sent_at.lt.${oneHourAgo}`);

      return events || [];
    } catch (error) {
      console.error('Error fetching events requiring reminders:', error);
      return [];
    }
  }

  private shouldSendReminder(hoursUntilEvent: number, reminderHours: number[]): boolean {
    // Check if current time matches any configured reminder time (within 30 minutes)
    return reminderHours.some(hours => 
      Math.abs(hoursUntilEvent - hours) <= 0.5
    );
  }

  private getHoursUntilEvent(eventDateTime: string | null): number {
    if (!eventDateTime) return 0;
    
    const eventDate = new Date(eventDateTime);
    const now = new Date();
    return Math.max(0, (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  }

  private formatEventType(eventType: string | null): string {
    if (!eventType) return 'appointment';
    
    const typeMap: Record<string, string> = {
      'service_call': 'service call',
      'meeting': 'meeting',
      'appointment': 'appointment',
      'demo': 'demo',
      'follow_up': 'follow-up',
      'quote': 'quote appointment',
      'consultation': 'consultation',
      'inspection': 'inspection',
      'emergency': 'emergency service'
    };
    
    return typeMap[eventType] || eventType.replace('_', ' ');
  }

  private async scheduleReminder(job: ReminderJob): Promise<void> {
    // In a production environment, this would add the job to a queue
    // For now, we'll store it in the database for processing
    console.log(`Reminder scheduled for event ${job.eventId} at ${job.scheduledFor}`);
  }

  private async logCommunication(log: CommunicationLog): Promise<void> {
    try {
      await this.supabase
        .from('communication_logs')
        .insert(log);
    } catch (error) {
      console.error('Failed to log communication:', error);
    }
  }
}

// Export singleton instance
export const reminderService = new ReminderService();