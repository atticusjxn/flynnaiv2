// Live Event Extractor for Flynn.ai v2 - Real-time appointment extraction

import OpenAI from 'openai';
import { createAdminClient } from '@/utils/supabase/server';

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
  private industryPrompts: { [key: string]: string } = {
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
`
  };

  /**
   * Extract events from live transcription with industry context
   */
  public async extractEventsFromLiveTranscription(
    callSid: string,
    transcriptionText: string,
    industry: string = 'general',
    confidence: number = 0.8
  ): Promise<LiveExtractionResult> {
    const startTime = Date.now();
    
    try {
      console.log(`Starting live event extraction for call ${callSid} (${industry})`);
      
      const industryContext = this.industryPrompts[industry] || this.industryPrompts.general;
      
      const systemPrompt = `You are Flynn.ai's live event extraction AI for ${industry} businesses. Extract appointment information from live phone call transcriptions.

${industryContext}

EXTRACTION RULES:
1. Extract ALL potential appointments, service requests, or scheduled events
2. Be aggressive in extracting partial information - better to capture something than nothing
3. Mark confidence levels honestly (0.0 = uncertain, 1.0 = completely certain)
4. For uncertain dates/times, extract relative references ("tomorrow", "next week")
5. Extract contact info aggressively (names, phones, addresses mentioned anywhere)
6. Identify urgency from tone, keywords, and context
7. Don't make up information - mark as null if not mentioned

RESPONSE FORMAT: Return ONLY valid JSON, no additional text:
{
  "events": [
    {
      "type": "service_call|appointment|meeting|quote|emergency",
      "title": "Brief descriptive title",
      "customer_name": "Full name if mentioned or null",
      "customer_phone": "Phone number if mentioned or null",
      "customer_email": "Email if mentioned or null", 
      "location": "Full address or partial location or null",
      "proposed_datetime": "ISO datetime if specific or relative time if mentioned or null",
      "description": "Detailed description of what's needed",
      "urgency": "low|medium|high|emergency",
      "price_estimate": "Dollar amount if mentioned or null",
      "confidence": 0.0-1.0,
      "service_type": "Specific service category or null",
      "notes": "Additional important details or null"
    }
  ],
  "overall_confidence": 0.0-1.0,
  "industry_context": "${industry}",
  "key_indicators": ["list", "of", "key", "words", "that", "triggered", "extraction"]
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Extract events from this live call transcription:\n\n"${transcriptionText}"` 
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      let extractedData;
      try {
        extractedData = JSON.parse(response);
      } catch (parseError) {
        console.error(`Failed to parse OpenAI response for call ${callSid}:`, parseError);
        console.error('Raw response:', response);
        throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
      }

      const processingTime = Date.now() - startTime;
      
      const result: LiveExtractionResult = {
        callSid,
        events: extractedData.events || [],
        overall_confidence: extractedData.overall_confidence || confidence,
        industry_context: industry,
        transcription_text: transcriptionText,
        extraction_timestamp: new Date().toISOString(),
        processing_time_ms: processingTime
      };

      console.log(`Live extraction completed for call ${callSid}: ${result.events.length} events found in ${processingTime}ms`);
      
      // Store the results
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
        processing_time_ms: Date.now() - startTime
      };
    }
  }

  /**
   * Store live extraction results in the database
   */
  private async storeLiveExtractionResults(result: LiveExtractionResult): Promise<void> {
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
          updated_at: new Date().toISOString()
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
            await supabase
              .from('events')
              .insert({
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
                created_at: new Date().toISOString()
              });
          }
        }
      }

      console.log(`Stored ${result.events.length} events for call ${result.callSid}`);

    } catch (error) {
      console.error(`Error storing live extraction results for call ${result.callSid}:`, error);
    }
  }

  /**
   * Calculate overall urgency from multiple events
   */
  private calculateOverallUrgency(events: ExtractedEvent[]): 'low' | 'medium' | 'high' | 'emergency' {
    if (events.length === 0) return 'medium';
    
    const urgencyLevels = events.map(event => event.urgency);
    
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
    industry: string = 'general'
  ): Promise<LiveExtractionResult> {
    // Combine previous context for better extraction
    const contextText = previousExtractions.length > 0 
      ? `Previous context: ${previousExtractions.map(e => e.description).join('; ')}\n\nNew transcription: ${newTranscription}`
      : newTranscription;

    return await this.extractEventsFromLiveTranscription(callSid, contextText, industry);
  }

  /**
   * Validate extracted events for quality
   */
  public validateExtractedEvents(events: ExtractedEvent[]): ExtractedEvent[] {
    return events.filter(event => {
      // Basic validation rules
      if (!event.title || event.title.trim().length < 5) return false;
      if (!event.description || event.description.trim().length < 10) return false;
      if (event.confidence < 0.3) return false; // Too low confidence
      
      return true;
    });
  }
}

// Singleton instance
export const liveEventExtractor = new LiveEventExtractor();

/**
 * Export function for use in RealTimeProcessor
 */
export async function extractLiveEvents(
  callSid: string,
  transcriptionText: string,
  industry: string = 'general',
  confidence: number = 0.8
): Promise<LiveExtractionResult> {
  return await liveEventExtractor.extractEventsFromLiveTranscription(
    callSid, 
    transcriptionText, 
    industry, 
    confidence
  );
}