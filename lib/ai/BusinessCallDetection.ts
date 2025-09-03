// Flynn.ai v2 - AI Business Call Detection
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class BusinessCallDetection {
  /**
   * Determines if a call transcription represents a business-related conversation
   * vs a personal call that should not be processed
   */
  async detectBusinessCall(
    transcription: string,
    userIndustry?: string,
    userCompanyName?: string
  ): Promise<{
    isBusinessCall: boolean;
    confidence: number;
    reasoning: string;
    callType: string;
  }> {
    if (!transcription || transcription.length < 30) {
      return {
        isBusinessCall: false,
        confidence: 0.1,
        reasoning: 'Transcription too short to analyze',
        callType: 'unknown',
      };
    }

    const industryContext = userIndustry
      ? this.getIndustryContext(userIndustry)
      : '';

    const systemPrompt = `You are Flynn.ai's business call detection system. Analyze phone call transcriptions to determine if they are business-related conversations that should be processed for appointment scheduling.

BUSINESS CALL INDICATORS:
- Service requests, quotes, appointments
- Customer inquiries about services/products  
- Scheduling, booking, or planning discussions
- Professional consultations
- Sales or business development calls
- Problem-solving for business services
- Work-related coordination

PERSONAL CALL INDICATORS:
- Family conversations, personal relationships
- Social plans unrelated to business
- Personal medical appointments (unless user is medical professional)
- General chatting without business purpose
- Wrong numbers or misdials
- Spam/robocalls

${industryContext}

IMPORTANT: Be conservative - only mark as business calls if there's clear business intent. When uncertain, mark as personal to avoid processing irrelevant calls.

Respond with JSON only:
{
  "isBusinessCall": boolean,
  "confidence": number (0.0-1.0),
  "reasoning": "Brief explanation",
  "callType": "service_request|quote_inquiry|appointment_scheduling|consultation|sales_call|customer_support|personal|social|spam|unknown"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Analyze this call transcription:\n\n${transcription}\n\nCompany: ${userCompanyName || 'Unknown'}\nIndustry: ${userIndustry || 'Unknown'}`,
          },
        ],
        temperature: 0.1, // Low temperature for consistent classification
        max_tokens: 200,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      // Validate response format
      if (typeof result.isBusinessCall !== 'boolean') {
        throw new Error('Invalid AI response format');
      }

      return {
        isBusinessCall: result.isBusinessCall,
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
        reasoning: result.reasoning || 'No reasoning provided',
        callType: result.callType || 'unknown',
      };
    } catch (error) {
      console.error('Business call detection failed:', error);

      // Fallback to keyword-based detection
      return this.fallbackBusinessDetection(transcription, userIndustry);
    }
  }

  /**
   * Get industry-specific context for better business call detection
   */
  private getIndustryContext(industry: string): string {
    const contexts = {
      plumbing: `
USER INDUSTRY: Plumbing/HVAC Services
Business calls typically involve:
- Plumbing emergencies (leaks, blocked drains, no water)
- HVAC issues (heating, cooling, ventilation)
- Installation requests (taps, toilets, hot water systems)
- Maintenance appointments
- Service quotes and estimates
Personal calls would be family/friends, NOT customers needing plumbing services.`,

      real_estate: `
USER INDUSTRY: Real Estate
Business calls typically involve:
- Property inquiries and showings
- Buyer/seller consultations
- Market analysis discussions  
- Listing appointments
- Property management issues
Personal calls would be family/friends, NOT clients discussing real estate.`,

      legal: `
USER INDUSTRY: Legal Services
Business calls typically involve:
- Legal consultations and advice
- Case discussions with clients
- Court scheduling and procedures
- Contract and legal document reviews
Personal calls would be family/friends, NOT clients needing legal services.`,

      medical: `
USER INDUSTRY: Medical Practice
Business calls typically involve:
- Patient appointment bookings
- Medical consultations and follow-ups
- Treatment scheduling
- Medical emergencies or urgent care
- Prescription or treatment inquiries
Personal calls would be family/friends, NOT patients needing medical services.`,

      consulting: `
USER INDUSTRY: Consulting Services
Business calls typically involve:
- Business strategy discussions
- Consultation bookings
- Project planning and scoping
- Client check-ins and reviews
- Service proposals and contracts
Personal calls would be family/friends, NOT clients needing consulting services.`,

      sales: `
USER INDUSTRY: Sales/Business Development
Business calls typically involve:
- Sales inquiries and lead qualification
- Product demonstrations and presentations
- Follow-up calls with prospects
- Deal negotiations and closing
- Customer relationship management
Personal calls would be family/friends, NOT prospects or customers.`,
    };

    return (
      contexts[industry as keyof typeof contexts] ||
      `
USER INDUSTRY: ${industry}
Business calls typically involve customers, clients, or prospects discussing services, products, appointments, or professional matters.
Personal calls would be family/friends having social conversations.`
    );
  }

  /**
   * Fallback keyword-based business detection when AI fails
   */
  private fallbackBusinessDetection(
    transcription: string,
    userIndustry?: string
  ): {
    isBusinessCall: boolean;
    confidence: number;
    reasoning: string;
    callType: string;
  } {
    const businessKeywords = [
      // Universal business terms
      'quote',
      'service',
      'appointment',
      'booking',
      'estimate',
      'consultation',
      'repair',
      'fix',
      'install',
      'problem',
      'issue',
      'help',
      'urgent',
      'schedule',
      'available',
      'price',
      'cost',
      'how much',
      'when can you',

      // Industry-specific terms
      'plumber',
      'electrician',
      'hvac',
      'heating',
      'cooling',
      'leak',
      'drain',
      'property',
      'house',
      'home',
      'real estate',
      'buy',
      'sell',
      'rent',
      'lawyer',
      'legal',
      'case',
      'court',
      'contract',
      'advice',
      'doctor',
      'appointment',
      'medical',
      'patient',
      'health',
      'treatment',
      'business',
      'company',
      'client',
      'customer',
      'meeting',
      'project',
    ];

    const personalKeywords = [
      'family',
      'friend',
      'birthday',
      'party',
      'dinner',
      'movie',
      'weekend',
      'vacation',
      'holiday',
      'personal',
      'social',
      'chat',
      'catch up',
      'love you',
      'miss you',
      'how are you',
      'what are you doing',
    ];

    const businessScore = this.countKeywords(transcription, businessKeywords);
    const personalScore = this.countKeywords(transcription, personalKeywords);

    const isBusinessCall = businessScore > personalScore && businessScore > 0;
    const confidence = Math.min(
      0.8,
      (businessScore - personalScore) /
        Math.max(businessScore + personalScore, 1)
    );

    return {
      isBusinessCall,
      confidence: Math.max(0.1, confidence),
      reasoning: `Fallback keyword detection: ${businessScore} business keywords, ${personalScore} personal keywords`,
      callType: isBusinessCall ? 'unknown_business' : 'personal',
    };
  }

  /**
   * Count keyword occurrences in transcription (case-insensitive)
   */
  private countKeywords(text: string, keywords: string[]): number {
    const lowerText = text.toLowerCase();
    return keywords.reduce((count, keyword) => {
      return count + (lowerText.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);
  }

  /**
   * Get call statistics for analytics
   */
  async getCallAnalytics(
    userId: string,
    days: number = 30
  ): Promise<{
    totalCalls: number;
    businessCalls: number;
    personalCalls: number;
    averageConfidence: number;
    callTypes: Record<string, number>;
  }> {
    // This would integrate with your database to get call analytics
    // Implementation depends on your database structure
    return {
      totalCalls: 0,
      businessCalls: 0,
      personalCalls: 0,
      averageConfidence: 0,
      callTypes: {},
    };
  }
}
