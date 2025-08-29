import { Resend } from 'resend';
import { getIndustryConfiguration } from '@/lib/industry/configurations';
import CallOverviewEmail from '@/components/email-templates/CallOverviewEmail';
import PlumbingEmail from '@/components/email-templates/industry/PlumbingEmail';
import RealEstateEmail from '@/components/email-templates/industry/RealEstateEmail';
import LegalEmail from '@/components/email-templates/industry/LegalEmail';
import MedicalEmail from '@/components/email-templates/industry/MedicalEmail';
import SalesEmail from '@/components/email-templates/industry/SalesEmail';
import ConsultingEmail from '@/components/email-templates/industry/ConsultingEmail';
import { render } from '@react-email/render';
import { createCalendarInvite } from '@/lib/calendar/icsGenerator';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailNotificationData {
  // User and company info
  userEmail: string;
  companyName: string;
  industry: string;
  userName?: string;
  
  // Call information
  callSummary: {
    callerPhone: string;
    callerName?: string;
    duration: number;
    timestamp: string;
    callSid: string;
  };
  
  // AI extraction results
  extractedEvents: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    proposedDateTime?: string;
    location?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    urgency: string;
    confidence: number;
    estimatedPrice?: number;
    notes?: string;
  }>;
  
  // Additional context
  transcriptionSnippet?: string;
  callId: string;
  dashboardUrl?: string;
  
  // Industry-specific data
  industrySpecificData?: {
    // Plumbing
    emergencyContact?: string;
    afterHoursAvailable?: boolean;
    
    // Real Estate
    agentLicense?: string;
    brokerageInfo?: string;
    mlsNumber?: string;
    
    // Legal
    attorneyBarNumber?: string;
    lawFirm?: string;
    practiceAreas?: string[];
    confidentialityRequired?: boolean;
    
    // Medical
    providerNPI?: string;
    medicalFacility?: string;
    specialties?: string[];
    hipaaCompliant?: boolean;
    
    // Sales
    salesRepName?: string;
    salesTerritory?: string;
    crmIntegration?: boolean;
    pipelineStage?: string;
    
    // Consulting
    consultantName?: string;
    specialization?: string[];
    certifications?: string[];
    projectComplexity?: 'low' | 'medium' | 'high' | 'enterprise';
  };
}

export interface EmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

/**
 * Main email notification service that routes to industry-specific templates
 */
export class EmailNotificationService {
  private dashboardUrl: string;
  
  constructor() {
    this.dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flynn.ai';
  }
  
  /**
   * Send industry-specific email notification
   */
  async sendCallNotification(data: EmailNotificationData): Promise<EmailResult> {
    try {
      // Get industry configuration
      const industryConfig = getIndustryConfiguration(data.industry);
      
      // Generate subject line
      const subjectLine = this.generateSubjectLine(data, industryConfig);
      
      // Render appropriate email template
      const emailHtml = await this.renderEmailTemplate(data);
      
      // Generate calendar attachments if events exist
      const attachments = await this.generateCalendarAttachments(data);
      
      // Send email via Resend
      const result = await resend.emails.send({
        from: 'Flynn.ai <notifications@flynn.ai>',
        to: [data.userEmail],
        subject: subjectLine,
        html: emailHtml,
        attachments: attachments.length > 0 ? attachments : undefined,
        headers: {
          'X-Flynn-Industry': data.industry,
          'X-Flynn-Call-ID': data.callId,
          'X-Flynn-Event-Count': data.extractedEvents.length.toString(),
        },
        tags: [
          { name: 'industry', value: data.industry },
          { name: 'event_count', value: data.extractedEvents.length.toString() },
          { name: 'has_urgent', value: this.hasUrgentEvents(data).toString() },
        ],
      });
      
      return {
        success: true,
        emailId: result.data?.id,
        attachments: attachments,
      };
      
    } catch (error) {
      console.error('Email notification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error',
      };
    }
  }
  
  /**
   * Render the appropriate industry-specific email template
   */
  private async renderEmailTemplate(data: EmailNotificationData): Promise<string> {
    const baseProps = {
      companyName: data.companyName,
      industry: data.industry,
      callSummary: data.callSummary,
      extractedEvents: data.extractedEvents,
      transcriptionSnippet: data.transcriptionSnippet,
      callId: data.callId,
      userEmail: data.userEmail,
      dashboardUrl: this.dashboardUrl,
    };
    
    // Route to industry-specific template
    switch (data.industry) {
      case 'plumbing':
        return render(PlumbingEmail({
          ...baseProps,
          emergencyContact: data.industrySpecificData?.emergencyContact,
          afterHoursAvailable: data.industrySpecificData?.afterHoursAvailable,
        }));
        
      case 'real_estate':
        return render(RealEstateEmail({
          ...baseProps,
          agentLicense: data.industrySpecificData?.agentLicense,
          brokerageInfo: data.industrySpecificData?.brokerageInfo,
          mlsNumber: data.industrySpecificData?.mlsNumber,
        }));
        
      case 'legal':
        return render(LegalEmail({
          ...baseProps,
          attorneyBarNumber: data.industrySpecificData?.attorneyBarNumber,
          lawFirm: data.industrySpecificData?.lawFirm,
          practiceAreas: data.industrySpecificData?.practiceAreas,
          confidentialityRequired: data.industrySpecificData?.confidentialityRequired,
        }));
        
      case 'medical':
        return render(MedicalEmail({
          ...baseProps,
          providerNPI: data.industrySpecificData?.providerNPI,
          medicalFacility: data.industrySpecificData?.medicalFacility,
          specialties: data.industrySpecificData?.specialties,
          hipaaCompliant: data.industrySpecificData?.hipaaCompliant,
        }));
        
      case 'sales':
        return render(SalesEmail({
          ...baseProps,
          salesRepName: data.industrySpecificData?.salesRepName,
          salesTerritory: data.industrySpecificData?.salesTerritory,
          crmIntegration: data.industrySpecificData?.crmIntegration,
          pipelineStage: data.industrySpecificData?.pipelineStage,
        }));
        
      case 'consulting':
        return render(ConsultingEmail({
          ...baseProps,
          consultantName: data.industrySpecificData?.consultantName,
          specialization: data.industrySpecificData?.specialization,
          certifications: data.industrySpecificData?.certifications,
          projectComplexity: data.industrySpecificData?.projectComplexity,
        }));
        
      default:
        // Fall back to general template
        return render(CallOverviewEmail(baseProps));
    }
  }
  
  /**
   * Generate appropriate subject line based on industry and events
   */
  private generateSubjectLine(data: EmailNotificationData, industryConfig: any): string {
    const { terminology } = industryConfig;
    const hasUrgent = this.hasUrgentEvents(data);
    const hasEmergency = this.hasEmergencyEvents(data);
    const eventCount = data.extractedEvents.length;
    
    // Emergency/urgent prefix
    let prefix = '';
    if (hasEmergency) {
      prefix = '🚨 EMERGENCY - ';
    } else if (hasUrgent) {
      prefix = '⚡ URGENT - ';
    }
    
    // Base subject based on events
    let baseSubject = '';
    if (eventCount === 0) {
      baseSubject = `New call summary from ${data.callSummary.callerPhone}`;
    } else if (eventCount === 1) {
      const event = data.extractedEvents[0];
      baseSubject = `New ${terminology.appointment}: ${event.title || 'Appointment Request'}`;
    } else {
      baseSubject = `${eventCount} new ${terminology.appointment}s from ${data.callSummary.callerPhone}`;
    }
    
    // Add company context
    const companyContext = ` | ${data.companyName}`;
    
    return prefix + baseSubject + companyContext;
  }
  
  /**
   * Generate calendar invite attachments for extracted events
   */
  private async generateCalendarAttachments(data: EmailNotificationData): Promise<Array<{
    filename: string;
    content: string;
    contentType: string;
  }>> {
    const attachments = [];
    
    for (const event of data.extractedEvents) {
      if (event.proposedDateTime) {
        try {
          const icsContent = await createCalendarInvite({
            title: event.title,
            description: event.description,
            startDateTime: event.proposedDateTime,
            duration: 60, // Default 60 minutes
            location: event.location,
            organizer: {
              name: data.companyName,
              email: data.userEmail,
            },
            attendees: event.customerEmail ? [{
              name: event.customerName || 'Customer',
              email: event.customerEmail,
            }] : [],
          });
          
          attachments.push({
            filename: `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`,
            content: icsContent,
            contentType: 'text/calendar',
          });
        } catch (error) {
          console.error(`Failed to generate calendar invite for event ${event.id}:`, error);
        }
      }
    }
    
    return attachments;
  }
  
  /**
   * Check if any events have high urgency
   */
  private hasUrgentEvents(data: EmailNotificationData): boolean {
    return data.extractedEvents.some(event => event.urgency === 'high' || event.urgency === 'emergency');
  }
  
  /**
   * Check if any events are emergency level
   */
  private hasEmergencyEvents(data: EmailNotificationData): boolean {
    return data.extractedEvents.some(event => event.urgency === 'emergency');
  }
  
  /**
   * Send email preview for testing
   */
  async sendEmailPreview(data: EmailNotificationData, previewEmail: string): Promise<EmailResult> {
    try {
      const emailHtml = await this.renderEmailTemplate(data);
      
      const result = await resend.emails.send({
        from: 'Flynn.ai <notifications@flynn.ai>',
        to: [previewEmail],
        subject: `[PREVIEW] ${this.generateSubjectLine(data, getIndustryConfiguration(data.industry))}`,
        html: emailHtml,
        headers: {
          'X-Flynn-Preview': 'true',
          'X-Flynn-Industry': data.industry,
        },
      });
      
      return {
        success: true,
        emailId: result.data?.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Preview email failed',
      };
    }
  }
  
  /**
   * Get email analytics and performance data
   */
  async getEmailAnalytics(timeRange: { start: Date; end: Date }) {
    // This would integrate with Resend's analytics API
    // For now, returning a placeholder structure
    return {
      totalSent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      complained: 0,
      industryBreakdown: {},
      urgencyBreakdown: {},
    };
  }
}

/**
 * Factory function to create configured service instance
 */
export function createEmailNotificationService(): EmailNotificationService {
  return new EmailNotificationService();
}

/**
 * Utility function for quick email sending
 */
export async function sendQuickNotification(data: EmailNotificationData): Promise<EmailResult> {
  const service = createEmailNotificationService();
  return service.sendCallNotification(data);
}

/**
 * Batch send notifications (for multiple users/calls)
 */
export async function sendBatchNotifications(notifications: EmailNotificationData[]): Promise<EmailResult[]> {
  const service = createEmailNotificationService();
  const results = await Promise.allSettled(
    notifications.map(data => service.sendCallNotification(data))
  );
  
  return results.map(result => 
    result.status === 'fulfilled' 
      ? result.value 
      : { success: false, error: 'Batch send failed' }
  );
}

/**
 * Email template validation
 */
export function validateEmailData(data: EmailNotificationData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.userEmail || !data.userEmail.includes('@')) {
    errors.push('Valid user email is required');
  }
  
  if (!data.companyName?.trim()) {
    errors.push('Company name is required');
  }
  
  if (!data.industry?.trim()) {
    errors.push('Industry is required');
  }
  
  if (!data.callSummary?.callerPhone?.trim()) {
    errors.push('Caller phone number is required');
  }
  
  if (!data.callId?.trim()) {
    errors.push('Call ID is required');
  }
  
  if (data.extractedEvents) {
    data.extractedEvents.forEach((event, index) => {
      if (!event.title?.trim()) {
        errors.push(`Event ${index + 1} requires a title`);
      }
      if (!event.type?.trim()) {
        errors.push(`Event ${index + 1} requires a type`);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export types for external use
export type { EmailNotificationData, EmailResult };