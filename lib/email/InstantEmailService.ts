// Instant Email Service for Flynn.ai v2 - Professional email delivery within 2 minutes

import { Resend } from 'resend';
import { createAdminClient } from '@/utils/supabase/server';
import { generateAppointmentSummaryEmail } from '@/lib/email/EmailTemplates';
import { generateICSFile } from '@/lib/calendar/icsGenerator';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailDeliveryRequest {
  callSid: string;
  userId: string;
  userEmail: string;
  companyName?: string;
  industry: string;
  extractedEvents: any[];
  callDuration?: number;
  callerPhone: string;
  transcriptionText?: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  emailId?: string;
  deliveryTime: number;
  error?: string;
  attachments: number;
}

export class InstantEmailService {
  private static instance: InstantEmailService;
  private deliveryQueue: Map<string, EmailDeliveryRequest> = new Map();
  private readonly MAX_DELIVERY_TIME = 2 * 60 * 1000; // 2 minutes
  private readonly RETRY_ATTEMPTS = 3;

  public static getInstance(): InstantEmailService {
    if (!InstantEmailService.instance) {
      InstantEmailService.instance = new InstantEmailService();
    }
    return InstantEmailService.instance;
  }

  /**
   * Queue email for instant delivery
   */
  public async queueEmailDelivery(request: EmailDeliveryRequest): Promise<void> {
    console.log(`Queueing instant email delivery for call: ${request.callSid}`);
    
    this.deliveryQueue.set(request.callSid, request);

    // Start delivery immediately (don't wait)
    this.processEmailDelivery(request).catch(error => {
      console.error(`Error in email delivery for call ${request.callSid}:`, error);
    });
  }

  /**
   * Process email delivery with 2-minute guarantee
   */
  private async processEmailDelivery(request: EmailDeliveryRequest): Promise<EmailDeliveryResult> {
    const startTime = Date.now();
    let attempts = 0;

    console.log(`Starting instant email delivery for call: ${request.callSid}`);

    while (attempts < this.RETRY_ATTEMPTS) {
      try {
        attempts++;
        
        // Generate email content
        const emailContent = await this.generateEmailContent(request);
        
        // Generate attachments
        const attachments = await this.generateAttachments(request);
        
        // Send email via Resend
        const emailResult = await resend.emails.send({
          from: 'Flynn.ai <appointments@flynnai.com>',
          to: [request.userEmail],
          subject: emailContent.subject,
          html: emailContent.html,
          attachments: attachments,
          headers: {
            'X-Flynn-CallSid': request.callSid,
            'X-Flynn-Industry': request.industry,
            'X-Flynn-Events': request.extractedEvents.length.toString()
          }
        });

        const deliveryTime = Date.now() - startTime;
        
        console.log(`Email delivered successfully for call ${request.callSid} in ${deliveryTime}ms`);

        // Update database
        await this.updateEmailDeliveryStatus(request.callSid, true, emailResult.data?.id, deliveryTime);
        
        // Remove from queue
        this.deliveryQueue.delete(request.callSid);

        return {
          success: true,
          emailId: emailResult.data?.id,
          deliveryTime,
          attachments: attachments.length
        };

      } catch (error) {
        console.error(`Email delivery attempt ${attempts} failed for call ${request.callSid}:`, error);
        
        // If this is our last attempt or we're close to the 2-minute limit, fail
        const elapsedTime = Date.now() - startTime;
        if (attempts >= this.RETRY_ATTEMPTS || elapsedTime > this.MAX_DELIVERY_TIME - 30000) {
          
          await this.updateEmailDeliveryStatus(request.callSid, false, undefined, elapsedTime, error.message);
          this.deliveryQueue.delete(request.callSid);
          
          return {
            success: false,
            deliveryTime: elapsedTime,
            error: error.message,
            attachments: 0
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
      attachments: 0
    };
  }

  /**
   * Generate email content from extracted events
   */
  private async generateEmailContent(request: EmailDeliveryRequest): Promise<{
    subject: string;
    html: string;
  }> {
    try {
      // Get call details from database
      const callDetails = await this.getCallDetails(request.callSid);
      
      // Generate email using template
      const emailData = {
        companyName: request.companyName || 'Your Business',
        industry: request.industry,
        callSummary: {
          callerPhone: request.callerPhone,
          duration: request.callDuration || 0,
          timestamp: new Date().toISOString()
        },
        extractedEvents: request.extractedEvents,
        transcriptionSnippet: request.transcriptionText?.substring(0, 200) || '',
        callId: request.callSid
      };

      const subject = this.generateEmailSubject(request);
      const html = await generateAppointmentSummaryEmail(emailData);

      return { subject, html };

    } catch (error) {
      console.error(`Error generating email content for call ${request.callSid}:`, error);
      throw error;
    }
  }

  /**
   * Generate email subject line
   */
  private generateEmailSubject(request: EmailDeliveryRequest): string {
    const eventCount = request.extractedEvents.length;
    const hasUrgent = request.extractedEvents.some(e => e.urgency === 'emergency' || e.urgency === 'high');
    
    let subject = '';
    
    if (hasUrgent) {
      subject = '🔴 URGENT: ';
    } else {
      subject = '📅 ';
    }

    if (eventCount === 0) {
      subject += `Call Summary from ${request.callerPhone}`;
    } else if (eventCount === 1) {
      const event = request.extractedEvents[0];
      subject += `New ${event.type}: ${event.title || 'Appointment Request'}`;
    } else {
      subject += `${eventCount} New Appointments from Your Call`;
    }

    // Add company context if available
    if (request.companyName) {
      subject += ` - ${request.companyName}`;
    }

    return subject;
  }

  /**
   * Generate email attachments (ICS files)
   */
  private async generateAttachments(request: EmailDeliveryRequest): Promise<any[]> {
    const attachments = [];

    try {
      // Generate ICS file for each event with date/time
      for (const [index, event] of request.extractedEvents.entries()) {
        if (event.proposed_datetime) {
          const icsContent = await generateICSFile({
            title: event.title,
            description: event.description,
            location: event.location,
            startTime: event.proposed_datetime,
            duration: 60, // Default 1 hour
            organizer: request.userEmail,
            attendee: event.customer_email || event.customer_phone
          });

          attachments.push({
            filename: `appointment-${index + 1}.ics`,
            content: icsContent,
            contentType: 'text/calendar'
          });
        }
      }

      // Generate a summary ICS file if multiple events
      if (request.extractedEvents.length > 1) {
        const summaryIcs = await this.generateSummaryICSFile(request);
        attachments.push({
          filename: 'call-appointments.ics',
          content: summaryIcs,
          contentType: 'text/calendar'
        });
      }

    } catch (error) {
      console.error(`Error generating attachments for call ${request.callSid}:`, error);
      // Don't fail the email send if attachments fail
    }

    return attachments;
  }

  /**
   * Generate summary ICS file for multiple events
   */
  private async generateSummaryICSFile(request: EmailDeliveryRequest): Promise<string> {
    // Create a summary calendar with all events
    const events = request.extractedEvents.filter(e => e.proposed_datetime);
    
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Flynn.ai//Appointment Summary//EN
CALSCALE:GREGORIAN
METHOD:REQUEST\n`;

    for (const event of events) {
      icsContent += `BEGIN:VEVENT
UID:${request.callSid}-${event.title.replace(/\s/g, '-')}-${Date.now()}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${new Date(event.proposed_datetime).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(new Date(event.proposed_datetime).getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location || ''}
STATUS:TENTATIVE
SEQUENCE:0
END:VEVENT\n`;
    }

    icsContent += `END:VCALENDAR`;
    
    return icsContent;
  }

  /**
   * Get additional call details from database
   */
  private async getCallDetails(callSid: string): Promise<any> {
    try {
      const supabase = createAdminClient();
      
      const { data: call } = await supabase
        .from('calls')
        .select(`
          *,
          users (
            email,
            company_name,
            industry
          )
        `)
        .eq('twilio_call_sid', callSid)
        .single();

      return call;
    } catch (error) {
      console.error(`Error fetching call details for ${callSid}:`, error);
      return null;
    }
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
          updated_at: new Date().toISOString()
        })
        .eq('twilio_call_sid', callSid);

      console.log(`Updated email delivery status for call ${callSid}: ${success ? 'success' : 'failed'}`);

    } catch (error) {
      console.error(`Error updating email delivery status for call ${callSid}:`, error);
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
      oldestRequest: this.deliveryQueue.size > 0 ? {
        callSid: Array.from(this.deliveryQueue.keys())[0],
        queueTime: Date.now() // Simplified - would need to track actual queue time
      } : undefined
    };
  }

  /**
   * Force delivery of queued email (for testing/debugging)
   */
  public async forceDelivery(callSid: string): Promise<EmailDeliveryResult | null> {
    const request = this.deliveryQueue.get(callSid);
    if (!request) {
      return null;
    }

    return await this.processEmailDelivery(request);
  }
}

// Export singleton instance
export const instantEmailService = InstantEmailService.getInstance();

/**
 * Queue email for instant delivery (main export function)
 */
export async function sendInstantAppointmentEmail(request: EmailDeliveryRequest): Promise<void> {
  return await instantEmailService.queueEmailDelivery(request);
}