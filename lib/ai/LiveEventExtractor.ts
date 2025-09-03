// Live Event Extractor for Flynn.ai v2 - Real-time appointment extraction
// Enhanced with industry-specific prompts and advanced confidence scoring

import OpenAI from 'openai';
import { createAdminClient } from '@/utils/supabase/server';
import { buildPlumbingPrompt } from '@/lib/ai/prompts/plumbing';
import { buildRealEstatePrompt } from '@/lib/ai/prompts/real-estate';
import { buildLegalPrompt } from '@/lib/ai/prompts/legal';
import { buildMedicalPrompt } from '@/lib/ai/prompts/medical';
import { buildSystemPrompt } from '@/lib/ai/prompts/base';
import { calculateEventConfidence } from '@/lib/ai/ConfidenceScoring';
import { classifyEvent } from '@/lib/ai/EventClassificationSystem';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractedEvent {
  type: 'service_call' | 'appointment' | 'meeting' | 'quote' | 'emergency';
  title: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  location: string | null;
  proposed_datetime: string | null;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  price_estimate: string | null;
  confidence: number;
  service_type: string | null;
  notes: string | null;
}

export interface LiveExtractionResult {
  callSid: string;
  events: ExtractedEvent[];
  overall_confidence: number;
  industry_context: string;
  transcription_text: string;
  extraction_timestamp: string;
  processing_time_ms: number;
}

export class LiveEventExtractor {
  // Enhanced industry prompt builders
  private getIndustryPrompt(industry: string, context?: any): string {
    switch (industry) {
      case 'plumbing':
        return buildPlumbingPrompt(context);
      case 'real_estate':
        return buildRealEstatePrompt(context);
      case 'legal':
        return buildLegalPrompt(context);
      case 'medical':
        return buildMedicalPrompt(context);
      default:
        return buildSystemPrompt(industry, context);
    }
  }

  // Legacy industry prompts for fallback
  private legacyIndustryPrompts: { [key: string]: string } = {
    plumbing: `
INDUSTRY: Plumbing/HVAC Services
FOCUS: Service addresses, problem descriptions, emergency indicators, time preferences, price estimates
URGENCY INDICATORS: flooding, burst pipes, no water/heat, sewage backup = EMERGENCY
TERMINOLOGY: "come out" = service_call, "take a look" = quote, "emergency" = emergency
CRITICAL INFO: Service address (required for field work), problem type, urgency, availability
`,

    real_estate: `
INDUSTRY: Real Estate
FOCUS: Property addresses, showing requests, buyer/seller status, timeline urgency
URGENCY INDICATORS: pre-approved buyers, cash buyers, "closing soon" = HIGH priority
TERMINOLOGY: "showing" = meeting, "walk through" = inspection, "tour" = meeting
CRITICAL INFO: Property address, showing time, buyer qualifications, decision timeline
`,

    legal: `
INDUSTRY: Legal Services
FOCUS: Legal matters, consultation requests, case types, urgency, confidentiality
URGENCY INDICATORS: court deadlines, statute limitations, emergency legal needs = HIGH/EMERGENCY
TERMINOLOGY: "consultation" = meeting, "legal matter" = case, "urgent" = high priority
CRITICAL INFO: Type of legal issue, timeline/deadlines, consultation availability
`,

    medical: `
INDUSTRY: Medical/Healthcare
FOCUS: Appointment requests, symptoms, urgency, patient info, insurance
URGENCY INDICATORS: severe symptoms, pain levels, urgent care needs = HIGH/EMERGENCY
TERMINOLOGY: "appointment" = appointment, "check-up" = appointment, "urgent" = emergency
CRITICAL INFO: Appointment type, urgency, availability, insurance information
`,

    general: `
INDUSTRY: General Business Services
FOCUS: Service requests, meetings, appointments, customer needs, availability
URGENCY INDICATORS: "urgent", "ASAP", "emergency", "right now" = HIGH/EMERGENCY
TERMINOLOGY: Standard business terminology
CRITICAL INFO: Service needed, contact info, timing, location if applicable
`,
  };

  /**
   * Extract events from live transcription with enhanced industry context
   */
  public async extractEventsFromLiveTranscription(
    callSid: string,
    transcriptionText: string,
    industry: string = 'general',
    transcriptionConfidence: number = 0.8,
    context?: any
  ): Promise<LiveExtractionResult> {
    const startTime = Date.now();

    try {
      console.log(
        `Starting enhanced live event extraction for call ${callSid} (${industry})`
      );

      // Use enhanced industry-specific prompts
      const systemPrompt = this.getIndustryPrompt(industry, context);

      console.log(`Using enhanced ${industry} prompt for extraction`);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Extract events from this live call transcription:\n\n"${transcriptionText}"`,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error('No response from OpenAI');
      }

      let extractedData;
      try {
        extractedData = JSON.parse(response);
      } catch (parseError) {
        console.error(
          `Failed to parse OpenAI response for call ${callSid}:`,
          parseError
        );
        console.error('Raw response:', response);
        throw new Error(
          `Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`
        );
      }

      const processingTime = Date.now() - startTime;

      // Enhance each extracted event with advanced confidence scoring
      const enhancedEvents =
        extractedData.events?.map((event: any) => {
          // Calculate enhanced confidence score
          const confidenceResult = calculateEventConfidence(
            event,
            transcriptionText,
            industry,
            transcriptionConfidence
          );

          // Classify the event type with industry context
          const classification = classifyEvent(
            event,
            transcriptionText,
            industry
          );

          return {
            ...event,
            confidence: confidenceResult.overallConfidence,
            type: classification.eventType,
            confidence_breakdown: confidenceResult.factors,
            quality_level: confidenceResult.qualityLevel,
            classification_reasoning: classification.reasoning,
            recommendations: confidenceResult.recommendations,
          };
        }) || [];

      // Calculate overall confidence from enhanced events
      const overallConfidence =
        enhancedEvents.length > 0
          ? enhancedEvents.reduce((sum, event) => sum + event.confidence, 0) /
            enhancedEvents.length
          : 0;

      const result: LiveExtractionResult = {
        callSid,
        events: enhancedEvents,
        overall_confidence: overallConfidence,
        industry_context: industry,
        transcription_text: transcriptionText,
        extraction_timestamp: new Date().toISOString(),
        processing_time_ms: processingTime,
      };

      console.log(
        `Enhanced live extraction completed for call ${callSid}: ${result.events.length} events found in ${processingTime}ms with ${overallConfidence.toFixed(2)} average confidence`
      );

      // Store the enhanced results
      await this.storeLiveExtractionResults(result);

      return result;
    } catch (error) {
      console.error(`Live event extraction failed for call ${callSid}:`, error);

      // Return empty result on error
      return {
        callSid,
        events: [],
        overall_confidence: 0.0,
        industry_context: industry,
        transcription_text: transcriptionText,
        extraction_timestamp: new Date().toISOString(),
        processing_time_ms: Date.now() - startTime,
      };
    }
  }

  /**
   * Store live extraction results in the database
   */
  private async storeLiveExtractionResults(
    result: LiveExtractionResult
  ): Promise<void> {
    try {
      const supabase = createAdminClient();

      // Update call record with extraction results
      await supabase
        .from('calls')
        .update({
          ai_processing_status: 'live_extraction_completed',
          transcription_text: result.transcription_text,
          transcription_confidence: result.overall_confidence,
          main_topic: result.events.length > 0 ? result.events[0].title : null,
          urgency_level: this.calculateOverallUrgency(result.events),
          updated_at: new Date().toISOString(),
        })
        .eq('twilio_call_sid', result.callSid);

      // Store individual events
      if (result.events.length > 0) {
        const callRecord = await supabase
          .from('calls')
          .select('id')
          .eq('twilio_call_sid', result.callSid)
          .single();

        if (callRecord.data) {
          for (const event of result.events) {
            await supabase.from('events').insert({
              call_id: callRecord.data.id,
              event_type: event.type,
              title: event.title,
              description: event.description,
              customer_name: event.customer_name,
              customer_phone: event.customer_phone,
              customer_email: event.customer_email,
              location: event.location,
              proposed_datetime: event.proposed_datetime,
              urgency_level: event.urgency,
              price_estimate: event.price_estimate,
              confidence_score: event.confidence,
              status: 'pending',
              source: 'live_extraction',
              created_at: new Date().toISOString(),
            });
          }
        }
      }

      console.log(
        `Stored ${result.events.length} events for call ${result.callSid}`
      );
    } catch (error) {
      console.error(
        `Error storing live extraction results for call ${result.callSid}:`,
        error
      );
    }
  }

  /**
   * Calculate overall urgency from multiple events
   */
  private calculateOverallUrgency(
    events: ExtractedEvent[]
  ): 'low' | 'medium' | 'high' | 'emergency' {
    if (events.length === 0) return 'medium';

    const urgencyLevels = events.map((event) => event.urgency);

    if (urgencyLevels.includes('emergency')) return 'emergency';
    if (urgencyLevels.includes('high')) return 'high';
    if (urgencyLevels.includes('medium')) return 'medium';
    return 'low';
  }

  /**
   * Extract events with context from previous extractions
   */
  public async extractEventsWithContext(
    callSid: string,
    newTranscription: string,
    previousExtractions: ExtractedEvent[],
    industry: string = 'general',
    transcriptionConfidence: number = 0.8
  ): Promise<LiveExtractionResult> {
    // Combine previous context for better extraction
    const contextText =
      previousExtractions.length > 0
        ? `Previous context: ${previousExtractions.map((e) => e.description).join('; ')}\n\nNew transcription: ${newTranscription}`
        : newTranscription;

    return await this.extractEventsFromLiveTranscription(
      callSid,
      contextText,
      industry,
      transcriptionConfidence
    );
  }

  /**
   * Enhanced validation of extracted events for quality
   */
  public validateExtractedEvents(
    events: ExtractedEvent[],
    industry: string = 'general'
  ): ExtractedEvent[] {
    return events.filter((event) => {
      // Enhanced validation rules
      if (!event.title || event.title.trim().length < 5) return false;
      if (!event.description || event.description.trim().length < 15)
        return false;
      if (event.confidence < 0.3) return false; // Too low confidence

      // Industry-specific validation
      if (
        industry === 'plumbing' &&
        !event.location &&
        event.type === 'service_call'
      ) {
        console.warn(`Plumbing service call without location: ${event.title}`);
        return false;
      }

      if (
        industry === 'real_estate' &&
        !event.location &&
        (event.type === 'showing' || event.type === 'meeting')
      ) {
        console.warn(
          `Real estate showing without property location: ${event.title}`
        );
        return false;
      }

      if (industry === 'medical' && event.urgency === 'emergency') {
        console.warn(
          `Medical emergency should be directed to ER, not appointment scheduling`
        );
        return false;
      }

      return true;
    });
  }
}

// Singleton instance
export const liveEventExtractor = new LiveEventExtractor();

/**
 * Enhanced export function for use in RealTimeProcessor
 */
export async function extractLiveEvents(
  callSid: string,
  transcriptionText: string,
  industry: string = 'general',
  transcriptionConfidence: number = 0.8,
  context?: any
): Promise<LiveExtractionResult> {
  return await liveEventExtractor.extractEventsFromLiveTranscription(
    callSid,
    transcriptionText,
    industry,
    transcriptionConfidence,
    context
  );
}
