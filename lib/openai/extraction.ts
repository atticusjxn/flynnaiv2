// GPT-4 Event Extraction for Flynn.ai v2
import { openai, OPENAI_CONFIG } from './client';
import { retry } from '../utils/retry';

export interface ExtractedEvent {
  id: string;
  type:
    | 'appointment'
    | 'service_call'
    | 'meeting'
    | 'consultation'
    | 'quote'
    | 'follow_up';
  title: string;
  description: string;

  // Time information
  proposed_date?: string; // ISO date string
  proposed_time?: string; // Time string
  duration_minutes?: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';

  // Customer information
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;

  // Location information
  service_address?: string;
  service_location?: string;

  // Business details
  service_type?: string;
  estimated_price?: number;
  price_range?: string;

  // AI metadata
  confidence_score: number;
  extraction_notes?: string;
}

export interface ExtractionResult {
  events: ExtractedEvent[];
  call_summary: string;
  call_topic: string;
  industry_detected?: string;
  processing_time: number;
  total_confidence: number;
}

export interface ExtractionError {
  error: string;
  details?: string;
  retryable: boolean;
}

export class EventExtractionService {
  /**
   * Extract events from call transcription using GPT-4
   */
  async extractEvents(
    transcription: string,
    industry?: string,
    callerInfo?: { from: string; to: string }
  ): Promise<ExtractionResult> {
    const startTime = Date.now();

    try {
      console.log('Starting event extraction with GPT-4');
      console.log(`Transcription length: ${transcription.length} characters`);
      console.log(`Industry context: ${industry || 'general'}`);

      const systemPrompt = this.buildSystemPrompt(industry);
      const userPrompt = this.buildUserPrompt(transcription, callerInfo);

      // Call GPT-4 with retry logic
      const response = await retry(
        () =>
          openai.chat.completions.create({
            model: OPENAI_CONFIG.extraction.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: OPENAI_CONFIG.extraction.temperature,
            max_tokens: OPENAI_CONFIG.extraction.max_tokens,
            response_format: OPENAI_CONFIG.extraction.response_format,
          }),
        {
          maxRetries: OPENAI_CONFIG.rateLimit.maxRetries,
          delay: OPENAI_CONFIG.rateLimit.retryDelay,
          backoff: OPENAI_CONFIG.rateLimit.backoffMultiplier,
        }
      );

      const processingTime = Date.now() - startTime;

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from GPT-4');
      }

      // Parse the JSON response
      const extractedData = JSON.parse(content);

      // Validate and process the extracted data
      const result = this.processExtractionResult(
        extractedData,
        processingTime
      );

      console.log(`Event extraction completed in ${processingTime}ms`);
      console.log(
        `Extracted ${result.events.length} events with confidence ${result.total_confidence}`
      );

      return result;
    } catch (error) {
      console.error('Event extraction error:', error);
      throw this.handleExtractionError(error);
    }
  }

  /**
   * Build system prompt based on industry
   */
  private buildSystemPrompt(industry?: string): string {
    const basePrompt = `You are Flynn.ai, an expert AI assistant specializing in extracting actionable events and appointments from business phone call transcriptions.

Your task is to analyze call transcripts and identify:
1. Appointments, meetings, service calls, or consultations mentioned
2. Customer contact information and service details
3. Timing, location, and urgency indicators
4. Price estimates or budget discussions

CRITICAL INSTRUCTIONS:
- Extract ONLY events that are clearly requested or discussed
- Assign realistic confidence scores (0.0-1.0) based on clarity
- Include extraction_notes to explain your reasoning
- If information is unclear, mark confidence as low and flag for human review
- Generate unique IDs for each event

RESPONSE FORMAT: Valid JSON only, no additional text.

JSON SCHEMA:
{
  "events": [
    {
      "id": "unique_id",
      "type": "appointment|service_call|meeting|consultation|quote|follow_up",
      "title": "Brief descriptive title",
      "description": "Detailed description",
      "proposed_date": "YYYY-MM-DD or null",
      "proposed_time": "HH:MM or time description",
      "duration_minutes": number_or_null,
      "urgency": "low|medium|high|emergency",
      "customer_name": "name_or_null",
      "customer_phone": "phone_or_null", 
      "customer_email": "email_or_null",
      "service_address": "address_or_null",
      "service_type": "service_description",
      "estimated_price": number_or_null,
      "price_range": "price_range_or_null",
      "confidence_score": 0.0_to_1.0,
      "extraction_notes": "reasoning"
    }
  ],
  "call_summary": "2-3 sentence summary",
  "call_topic": "Main topic/purpose",
  "industry_detected": "industry_or_null"
}`;

    // Add industry-specific context
    const industryContext = this.getIndustryContext(industry);

    return (
      basePrompt +
      (industryContext ? `\n\nINDUSTRY CONTEXT:\n${industryContext}` : '')
    );
  }

  /**
   * Get industry-specific extraction context
   */
  private getIndustryContext(industry?: string): string | null {
    const contexts = {
      plumbing: `PLUMBING SERVICES:
- Focus on service addresses (critical for field work)
- Common urgency: emergency (flooding, burst pipes), high (leaks), medium (repairs), low (maintenance)
- Service types: repair, installation, maintenance, emergency, inspection
- Price estimates often discussed for major work`,

      real_estate: `REAL ESTATE:
- Focus on property addresses and viewing appointments
- Common events: property showings, inspections, closings, consultations
- Urgency often relates to market competition or financing timelines
- Client qualification and pre-approval status important`,

      legal: `LEGAL SERVICES:
- Focus on consultation scheduling and case discussions
- Common events: consultations, meetings, court dates, document review
- Confidentiality important - may need special handling
- Urgency often relates to legal deadlines`,

      medical: `MEDICAL SERVICES:
- Focus on appointment scheduling and health concerns
- Common events: appointments, consultations, follow-ups, urgent care
- Patient privacy critical (HIPAA compliance)
- Urgency classification important for triage`,

      sales: `SALES:
- Focus on prospect meetings and product demonstrations
- Common events: demos, discovery calls, follow-ups, proposals
- Lead qualification and timeline important
- Price discussions and budget qualification common`,

      consulting: `CONSULTING SERVICES:
- Focus on strategic meetings and project discussions
- Common events: consultations, strategy sessions, workshops, check-ins
- Project scope and timeline discussions
- Retainer and project fee discussions common`,
    };

    return industry ? contexts[industry as keyof typeof contexts] : null;
  }

  /**
   * Build user prompt with transcription and context
   */
  private buildUserPrompt(
    transcription: string,
    callerInfo?: { from: string; to: string }
  ): string {
    let prompt = `TRANSCRIPTION TO ANALYZE:
${transcription}`;

    if (callerInfo) {
      prompt += `\n\nCALL METADATA:
- From: ${callerInfo.from}
- To: ${callerInfo.to}`;
    }

    prompt += `\n\nPlease extract all events, appointments, and actionable items from this call transcription. Return valid JSON only.`;

    return prompt;
  }

  /**
   * Process and validate extraction result
   */
  private processExtractionResult(
    data: any,
    processingTime: number
  ): ExtractionResult {
    // Validate required fields
    if (!data.events || !Array.isArray(data.events)) {
      throw new Error('Invalid extraction result: missing events array');
    }

    // Process each event
    const events: ExtractedEvent[] = data.events.map(
      (event: any, index: number) => ({
        id: event.id || `event_${index + 1}_${Date.now()}`,
        type: event.type || 'appointment',
        title: event.title || 'Extracted Event',
        description: event.description || '',
        proposed_date: event.proposed_date || null,
        proposed_time: event.proposed_time || null,
        duration_minutes: event.duration_minutes || null,
        urgency: event.urgency || 'medium',
        customer_name: event.customer_name || null,
        customer_phone: event.customer_phone || null,
        customer_email: event.customer_email || null,
        service_address: event.service_address || null,
        service_location: event.service_location || null,
        service_type: event.service_type || null,
        estimated_price: event.estimated_price || null,
        price_range: event.price_range || null,
        confidence_score: Math.max(
          0,
          Math.min(1, event.confidence_score || 0.7)
        ),
        extraction_notes: event.extraction_notes || null,
      })
    );

    // Calculate total confidence
    const totalConfidence =
      events.length > 0
        ? events.reduce((sum, event) => sum + event.confidence_score, 0) /
          events.length
        : 0;

    return {
      events,
      call_summary: data.call_summary || 'Call processed successfully',
      call_topic: data.call_topic || 'Business call',
      industry_detected: data.industry_detected || null,
      processing_time: processingTime,
      total_confidence: totalConfidence,
    };
  }

  /**
   * Handle extraction errors
   */
  private handleExtractionError(error: any): ExtractionError {
    if (error.status === 429) {
      return {
        error: 'Rate limit exceeded',
        details: 'OpenAI API rate limit reached. Please try again later.',
        retryable: true,
      };
    }

    if (error.status >= 500) {
      return {
        error: 'OpenAI server error',
        details: 'Temporary server error. Will retry automatically.',
        retryable: true,
      };
    }

    if (error.message?.includes('JSON')) {
      return {
        error: 'Response parsing error',
        details: 'GPT-4 returned invalid JSON response.',
        retryable: true,
      };
    }

    return {
      error: 'Event extraction failed',
      details:
        error.message || 'Unknown error occurred during event extraction.',
      retryable: false,
    };
  }
}

// Export singleton instance
export const eventExtractionService = new EventExtractionService();

// Convenience function
export async function extractEventsFromTranscription(
  transcription: string,
  industry?: string,
  callerInfo?: { from: string; to: string }
): Promise<ExtractionResult> {
  return eventExtractionService.extractEvents(
    transcription,
    industry,
    callerInfo
  );
}
