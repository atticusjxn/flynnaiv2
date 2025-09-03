// Flynn.ai v2 - SMS Service
// Twilio SMS messaging for customer notifications

import { twilioClient } from '@/lib/twilio/client';
import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types/database.types';

type CommunicationLog =
  Database['public']['Tables']['communication_logs']['Insert'];
type Event = Database['public']['Tables']['events']['Row'];

export interface SMSTemplate {
  type: 'confirmation' | 'reminder' | 'cancellation' | 'update';
  subject: string;
  content: string;
  variables: string[];
}

export interface SMSOptions {
  eventId?: string;
  callId?: string;
  recipientPhone: string;
  template: SMSTemplate;
  templateData: Record<string, string>;
  userId: string;
  scheduledFor?: Date;
}

export class SMSService {
  private supabase = createClient();
  private fromNumber: string;

  constructor() {
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    if (!this.fromNumber) {
      throw new Error('TWILIO_PHONE_NUMBER environment variable is required');
    }
  }

  async sendSMS(options: SMSOptions): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      // Generate message content from template
      const messageContent = this.generateMessageContent(
        options.template,
        options.templateData
      );

      // Send SMS via Twilio
      const message = await twilioClient.messages.create({
        body: messageContent,
        from: this.fromNumber,
        to: this.formatPhoneNumber(options.recipientPhone),
        ...(options.scheduledFor && {
          sendAt: options.scheduledFor,
          scheduleType: 'fixed' as const,
        }),
      });

      // Log communication to database
      await this.logCommunication({
        user_id: options.userId,
        event_id: options.eventId,
        call_id: options.callId,
        communication_type: 'sms',
        recipient: options.recipientPhone,
        subject: options.template.subject,
        content: messageContent,
        status: 'sent',
        external_id: message.sid,
        sent_at: new Date().toISOString(),
      });

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error) {
      console.error('SMS sending failed:', error);

      // Log failed communication
      await this.logCommunication({
        user_id: options.userId,
        event_id: options.eventId,
        call_id: options.callId,
        communication_type: 'sms',
        recipient: options.recipientPhone,
        subject: options.template.subject,
        content: this.generateMessageContent(
          options.template,
          options.templateData
        ),
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendEventConfirmation(
    event: Event,
    userId: string
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    if (!event.customer_phone) {
      return {
        success: false,
        error: 'Customer phone number not provided',
      };
    }

    const template: SMSTemplate = {
      type: 'confirmation',
      subject: 'Appointment Confirmation',
      content: `Hi {{customerName}}! Your {{eventType}} is confirmed for {{datetime}} at {{location}}. {{companyName}} - Reply STOP to opt out.`,
      variables: [
        'customerName',
        'eventType',
        'datetime',
        'location',
        'companyName',
      ],
    };

    const templateData = {
      customerName: event.customer_name || 'Customer',
      eventType: this.formatEventType(event.event_type),
      datetime: this.formatDateTime(
        event.confirmed_datetime || event.proposed_datetime
      ),
      location: event.location || 'TBD',
      companyName: await this.getCompanyName(userId),
    };

    return this.sendSMS({
      eventId: event.id,
      recipientPhone: event.customer_phone,
      template,
      templateData,
      userId,
    });
  }

  async sendEventReminder(
    event: Event,
    userId: string,
    hoursBeforeEvent: number = 24
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    if (!event.customer_phone || !event.confirmed_datetime) {
      return {
        success: false,
        error: 'Customer phone number or confirmed datetime not provided',
      };
    }

    const template: SMSTemplate = {
      type: 'reminder',
      subject: 'Appointment Reminder',
      content: `Reminder: Your {{eventType}} with {{companyName}} is {{timeUntil}}. {{datetime}} at {{location}}. Call us if you need to reschedule.`,
      variables: [
        'eventType',
        'companyName',
        'timeUntil',
        'datetime',
        'location',
      ],
    };

    const eventDate = new Date(event.confirmed_datetime);
    const now = new Date();
    const timeUntilEvent = this.formatTimeUntilEvent(now, eventDate);

    const templateData = {
      eventType: this.formatEventType(event.event_type),
      companyName: await this.getCompanyName(userId),
      timeUntil: timeUntilEvent,
      datetime: this.formatDateTime(event.confirmed_datetime),
      location: event.location || 'TBD',
    };

    return this.sendSMS({
      eventId: event.id,
      recipientPhone: event.customer_phone,
      template,
      templateData,
      userId,
    });
  }

  async sendEventUpdate(
    event: Event,
    userId: string,
    updateMessage: string
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    if (!event.customer_phone) {
      return {
        success: false,
        error: 'Customer phone number not provided',
      };
    }

    const template: SMSTemplate = {
      type: 'update',
      subject: 'Appointment Update',
      content: `{{companyName}} - Update for your {{eventType}} on {{datetime}}: {{updateMessage}}`,
      variables: ['companyName', 'eventType', 'datetime', 'updateMessage'],
    };

    const templateData = {
      companyName: await this.getCompanyName(userId),
      eventType: this.formatEventType(event.event_type),
      datetime: this.formatDateTime(
        event.confirmed_datetime || event.proposed_datetime
      ),
      updateMessage,
    };

    return this.sendSMS({
      eventId: event.id,
      recipientPhone: event.customer_phone,
      template,
      templateData,
      userId,
    });
  }

  private generateMessageContent(
    template: SMSTemplate,
    data: Record<string, string>
  ): string {
    let content = template.content;

    // Replace template variables
    for (const [key, value] of Object.entries(data)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return content;
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Add +1 if it's a 10-digit US number
    if (digits.length === 10) {
      return `+1${digits}`;
    }

    // Add + if it doesn't have one
    if (!phone.startsWith('+')) {
      return `+${digits}`;
    }

    return phone;
  }

  private formatEventType(eventType: string | null): string {
    if (!eventType) return 'appointment';

    const typeMap: Record<string, string> = {
      service_call: 'service call',
      meeting: 'meeting',
      appointment: 'appointment',
      demo: 'demo',
      follow_up: 'follow-up',
      quote: 'quote',
      consultation: 'consultation',
      inspection: 'inspection',
      emergency: 'emergency service',
    };

    return typeMap[eventType] || eventType.replace('_', ' ');
  }

  private formatDateTime(datetime: string | null): string {
    if (!datetime) return 'TBD';

    const date = new Date(datetime);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  private formatTimeUntilEvent(now: Date, eventDate: Date): string {
    const diffInHours = Math.round(
      (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return 'in less than an hour';
    } else if (diffInHours === 1) {
      return 'in 1 hour';
    } else if (diffInHours < 24) {
      return `in ${diffInHours} hours`;
    } else if (diffInHours < 48) {
      return 'tomorrow';
    } else {
      const days = Math.round(diffInHours / 24);
      return `in ${days} days`;
    }
  }

  private async getCompanyName(userId: string): Promise<string> {
    try {
      const { data: user } = await this.supabase
        .from('users')
        .select('company_name, full_name')
        .eq('id', userId)
        .single();

      return user?.company_name || user?.full_name || 'Your Service Provider';
    } catch (error) {
      console.error('Error fetching company name:', error);
      return 'Your Service Provider';
    }
  }

  private async logCommunication(log: CommunicationLog): Promise<void> {
    try {
      await this.supabase.from('communication_logs').insert(log);
    } catch (error) {
      console.error('Failed to log communication:', error);
    }
  }
}

// Export singleton instance
export const smsService = new SMSService();
