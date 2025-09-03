// React Email Service for Flynn.ai v2 - Professional email delivery using React Email templates

import { Resend } from 'resend';
import { render } from '@react-email/render';
import { createAdminClient } from '@/utils/supabase/server';
import CallOverviewEmail, {
  CallOverviewEmailProps,
} from '@/components/email-templates/CallOverviewEmail';
import PlumbingEmail from '@/components/email-templates/industry/PlumbingEmail';
import { generateICSFile, ICSEventData } from '@/lib/calendar/icsGenerator';

// Lazy initialize Resend client
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export interface ReactEmailDeliveryRequest {
  callSid: string;
  userId: string;
  userEmail: string;
  companyName?: string;
  industry: string;
  callSummary: {
    callerPhone: string;
    callerName?: string;
    duration: number;
    timestamp: string;
    callSid: string;
  };
  extractedEvents: any[];
  transcriptionText?: string;
  emergencyContact?: string;
  afterHoursAvailable?: boolean;
}

export interface EmailDeliveryResult {
  success: boolean;
  emailId?: string;
  deliveryTime: number;
  error?: string;
  attachments: number;
  templateUsed: string;
}

export class ReactEmailService {
  private static instance: ReactEmailService;
  private deliveryQueue: Map<string, ReactEmailDeliveryRequest> = new Map();
  private readonly MAX_DELIVERY_TIME = 2 * 60 * 1000; // 2 minutes
  private readonly RETRY_ATTEMPTS = 3;

  public static getInstance(): ReactEmailService {
    if (!ReactEmailService.instance) {
      ReactEmailService.instance = new ReactEmailService();
    }
    return ReactEmailService.instance;
  }

  /**
   * Queue email for instant delivery
   */
  public async queueEmailDelivery(
    request: ReactEmailDeliveryRequest
  ): Promise<void> {
    console.log(`Queueing React email delivery for call: ${request.callSid}`);

    this.deliveryQueue.set(request.callSid, request);

    // Start delivery immediately (don't wait)
    this.processEmailDelivery(request).catch((error) => {
      console.error(
        `Error in React email delivery for call ${request.callSid}:`,
        error
      );
    });
  }

  /**
   * Process email delivery with 2-minute guarantee
   */
  private async processEmailDelivery(
    request: ReactEmailDeliveryRequest
  ): Promise<EmailDeliveryResult> {
    const startTime = Date.now();
    let attempts = 0;

    console.log(`Starting React email delivery for call: ${request.callSid}`);

    while (attempts < this.RETRY_ATTEMPTS) {
      try {
        attempts++;

        // Generate email content using React Email
        const { emailHtml, emailSubject, templateUsed } =
          await this.generateReactEmailContent(request);

        // Generate attachments
        const attachments = await this.generateEmailAttachments(request);

        // Send email via Resend
        const emailResult = await getResendClient().emails.send({
          from: 'Flynn.ai <noreply@flynn.ai>',
          to: [request.userEmail],
          subject: emailSubject,
          html: emailHtml,
          attachments: attachments,
          headers: {
            'X-Flynn-CallSid': request.callSid,
            'X-Flynn-Industry': request.industry,
            'X-Flynn-Events': request.extractedEvents.length.toString(),
            'X-Flynn-Template': templateUsed,
          },
        });

        const deliveryTime = Date.now() - startTime;

        console.log(
          `React email delivered successfully for call ${request.callSid} in ${deliveryTime}ms using ${templateUsed}`
        );

        // Update database
        await this.updateEmailDeliveryStatus(
          request.callSid,
          true,
          emailResult.data?.id,
          deliveryTime
        );

        // Remove from queue
        this.deliveryQueue.delete(request.callSid);

        return {
          success: true,
          emailId: emailResult.data?.id,
          deliveryTime,
          attachments: attachments.length,
          templateUsed,
        };
      } catch (error) {
        console.error(
          `React email delivery attempt ${attempts} failed for call ${request.callSid}:`,
          error
        );

        // If this is our last attempt or we're close to the 2-minute limit, fail
        const elapsedTime = Date.now() - startTime;
        if (
          attempts >= this.RETRY_ATTEMPTS ||
          elapsedTime > this.MAX_DELIVERY_TIME - 30000
        ) {
          await this.updateEmailDeliveryStatus(
            request.callSid,
            false,
            undefined,
            elapsedTime,
            error instanceof Error ? error.message : 'Unknown error'
          );
          this.deliveryQueue.delete(request.callSid);

          return {
            success: false,
            deliveryTime: elapsedTime,
            error: error instanceof Error ? error.message : 'Unknown error',
            attachments: 0,
            templateUsed: 'error',
          };
        }

        // Wait before retry (exponential backoff)
        await this.delay(Math.min(1000 * Math.pow(2, attempts - 1), 10000));
      }
    }

    // This shouldn't be reached, but just in case
    return {
      success: false,
      deliveryTime: Date.now() - startTime,
      error: 'Max attempts exceeded',
      attachments: 0,
      templateUsed: 'error',
    };
  }

  /**
   * Generate email content using React Email templates
   */
  private async generateReactEmailContent(
    request: ReactEmailDeliveryRequest
  ): Promise<{
    emailHtml: string;
    emailSubject: string;
    templateUsed: string;
  }> {
    try {
      const dashboardUrl =
        process.env.NEXT_PUBLIC_APP_URL || 'https://flynn.ai';

      // Base email props
      const baseEmailProps: CallOverviewEmailProps = {
        companyName: request.companyName || 'Your Business',
        industry: request.industry,
        callSummary: request.callSummary,
        extractedEvents: request.extractedEvents,
        transcriptionSnippet: request.transcriptionText?.substring(0, 200),
        callId: request.callSid,
        userEmail: request.userEmail,
        dashboardUrl,
      };

      // Select template based on industry
      let emailHtml: string;
      let templateUsed: string;

      switch (request.industry) {
        case 'plumbing':
          emailHtml = render(
            PlumbingEmail({
              ...baseEmailProps,
              emergencyContact: request.emergencyContact,
              afterHoursAvailable: request.afterHoursAvailable,
            })
          );
          templateUsed = 'PlumbingEmail';
          break;

        // Add more industry-specific templates here
        case 'real_estate':
        case 'legal':
        case 'medical':
        default:
          emailHtml = render(CallOverviewEmail(baseEmailProps));
          templateUsed = 'CallOverviewEmail';
          break;
      }

      const emailSubject = this.generateEmailSubject(request);

      return { emailHtml, emailSubject, templateUsed };
    } catch (error) {
      console.error(
        `Error generating React email content for call ${request.callSid}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Generate email subject line
   */
  private generateEmailSubject(request: ReactEmailDeliveryRequest): string {
    const eventCount = request.extractedEvents.length;
    const hasUrgent = request.extractedEvents.some(
      (e) => e.urgency === 'emergency' || e.urgency === 'high'
    );

    let subject = '';

    // Urgency prefix
    if (hasUrgent) {
      if (request.extractedEvents.some((e) => e.urgency === 'emergency')) {
        subject = '🚨 EMERGENCY: ';
      } else {
        subject = '🔴 URGENT: ';
      }
    } else {
      subject = '📅 ';
    }

    // Main subject content
    if (eventCount === 0) {
      subject += `Call Summary from ${request.callSummary.callerPhone}`;
    } else if (eventCount === 1) {
      const event = request.extractedEvents[0];
      subject += `New ${this.getEventTypeLabel(event.type, request.industry)}: ${event.title || 'Appointment Request'}`;
    } else {
      subject += `${eventCount} New Appointments from Your Call`;
    }

    // Company context
    if (request.companyName) {
      subject += ` - ${request.companyName}`;
    }

    return subject;
  }

  /**
   * Get industry-specific event type label
   */
  private getEventTypeLabel(eventType: string, industry: string): string {
    const labels = {
      plumbing: {
        service_call: 'Service Request',
        emergency: 'Emergency Service',
        quote: 'Quote Request',
        appointment: 'Service Appointment',
      },
      real_estate: {
        showing: 'Property Showing',
        meeting: 'Client Meeting',
        inspection: 'Property Inspection',
        appointment: 'Appointment',
      },
      legal: {
        consultation: 'Legal Consultation',
        meeting: 'Client Meeting',
        appointment: 'Legal Appointment',
      },
      medical: {
        appointment: 'Medical Appointment',
        consultation: 'Consultation',
        urgent: 'Urgent Care',
      },
    };

    const industryLabels = (labels as any)[industry];
    return (
      industryLabels?.[eventType] ||
      eventType.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    );
  }

  /**
   * Generate email attachments (ICS files)
   */
  private async generateEmailAttachments(
    request: ReactEmailDeliveryRequest
  ): Promise<any[]> {
    const attachments = [];

    try {
      // Generate individual ICS files for each event with date/time
      for (let index = 0; index < request.extractedEvents.length; index++) {
        const event = request.extractedEvents[index];
        if (event.proposed_datetime) {
          const icsEventData: ICSEventData = {
            title: event.title || 'Flynn.ai Appointment',
            description: `${event.description}\n\nGenerated by Flynn.ai from phone call on ${new Date(request.callSummary.timestamp).toLocaleString()}`,
            location: event.location || event.service_address || '',
            startTime: event.proposed_datetime,
            duration: event.duration_minutes || 60,
            organizer: request.userEmail,
            attendee: event.customer_email || event.customer_phone || '',
            urgency: event.urgency,
          };

          const icsContent = await generateICSFile(icsEventData);

          attachments.push({
            filename: `appointment-${index + 1}.ics`,
            content: icsContent,
            contentType: 'text/calendar; charset=utf-8',
          });
        }
      }

      // Generate summary ICS file if multiple events
      if (
        request.extractedEvents.filter((e) => e.proposed_datetime).length > 1
      ) {
        const summaryIcs = await this.generateSummaryICSFile(request);
        attachments.push({
          filename: 'all-appointments.ics',
          content: summaryIcs,
          contentType: 'text/calendar; charset=utf-8',
        });
      }
    } catch (error) {
      console.error(
        `Error generating attachments for call ${request.callSid}:`,
        error
      );
      // Don't fail the email send if attachments fail
    }

    return attachments;
  }

  /**
   * Generate summary ICS file for multiple events
   */
  private async generateSummaryICSFile(
    request: ReactEmailDeliveryRequest
  ): Promise<string> {
    const events = request.extractedEvents.filter((e) => e.proposed_datetime);

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Flynn.ai//Call Appointments//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
X-WR-CALNAME:Flynn.ai Appointments
X-WR-CALDESC:Appointments extracted from call ${request.callSid}
\n`;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const startDate = new Date(event.proposed_datetime);
      const endDate = new Date(
        startDate.getTime() + (event.duration_minutes || 60) * 60 * 1000
      );

      icsContent += `BEGIN:VEVENT
UID:${request.callSid}-event-${i}-${Date.now()}@flynn.ai
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description}\\n\\nExtracted from call: ${request.callSummary.callerPhone}\\nUrgency: ${event.urgency}\\nConfidence: ${Math.round(event.confidence_score * 100)}%
LOCATION:${event.location || event.service_address || ''}
PRIORITY:${event.urgency === 'emergency' ? 1 : event.urgency === 'high' ? 3 : 5}
STATUS:TENTATIVE
SEQUENCE:0
CATEGORIES:Flynn.ai,${request.industry}
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Reminder: ${event.title}
TRIGGER:-PT15M
END:VALARM
END:VEVENT
\n`;
    }

    icsContent += `END:VCALENDAR`;

    return icsContent;
  }

  /**
   * Update email delivery status in database
   */
  private async updateEmailDeliveryStatus(
    callSid: string,
    success: boolean,
    emailId?: string,
    deliveryTime?: number,
    error?: string
  ): Promise<void> {
    try {
      const supabase = createAdminClient();

      await supabase
        .from('calls')
        .update({
          email_sent: success,
          email_sent_at: success ? new Date().toISOString() : null,
          email_delivery_time: deliveryTime,
          email_error: error || null,
          email_id: emailId || null,
          updated_at: new Date().toISOString(),
        })
        .eq('twilio_call_sid', callSid);

      console.log(
        `Updated React email delivery status for call ${callSid}: ${success ? 'success' : 'failed'}`
      );
    } catch (error) {
      console.error(
        `Error updating email delivery status for call ${callSid}:`,
        error
      );
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get delivery queue status
   */
  public getQueueStatus(): {
    queueSize: number;
    oldestRequest?: { callSid: string; queueTime: number };
  } {
    return {
      queueSize: this.deliveryQueue.size,
      oldestRequest:
        this.deliveryQueue.size > 0
          ? {
              callSid: Array.from(this.deliveryQueue.keys())[0],
              queueTime: Date.now(), // Simplified - would need to track actual queue time
            }
          : undefined,
    };
  }

  /**
   * Force delivery of queued email (for testing/debugging)
   */
  public async forceDelivery(
    callSid: string
  ): Promise<EmailDeliveryResult | null> {
    const request = this.deliveryQueue.get(callSid);
    if (!request) {
      return null;
    }

    return await this.processEmailDelivery(request);
  }

  /**
   * Preview email template (for development/testing)
   */
  public async previewEmail(
    request: ReactEmailDeliveryRequest
  ): Promise<string> {
    const { emailHtml } = await this.generateReactEmailContent(request);
    return emailHtml;
  }
}

// Export singleton instance
export const reactEmailService = ReactEmailService.getInstance();

/**
 * Queue React email for instant delivery (main export function)
 */
export async function sendReactAppointmentEmail(
  request: ReactEmailDeliveryRequest
): Promise<void> {
  return await reactEmailService.queueEmailDelivery(request);
}
