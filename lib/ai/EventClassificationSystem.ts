// Advanced Event Classification System for Flynn.ai v2
// Industry-aware event type classification with confidence scoring

import { ExtractedEvent } from '@/lib/ai/LiveEventExtractor';

export interface ClassificationResult {
  eventType: EventType;
  confidence: number;
  reasoning: string;
  alternativeTypes: Array<{ type: EventType; confidence: number }>;
  industryContext: string;
}

export type EventType =
  | 'service_call'
  | 'appointment'
  | 'meeting'
  | 'quote'
  | 'emergency'
  | 'consultation'
  | 'inspection'
  | 'follow_up'
  | 'installation'
  | 'repair'
  | 'maintenance'
  | 'showing'
  | 'listing_consultation'
  | 'buyer_consultation'
  | 'closing'
  | 'legal_consultation'
  | 'court_appearance'
  | 'medical_appointment'
  | 'procedure'
  | 'urgent_care'
  | 'wellness_visit';

export interface IndustryClassificationRules {
  industry: string;
  primaryTypes: EventType[];
  keywords: { [key in EventType]?: string[] };
  urgencyModifiers: { [key: string]: number };
  defaultType: EventType;
  emergencyTriggers: string[];
}

export class EventClassificationSystem {
  private industryRules: { [industry: string]: IndustryClassificationRules } = {
    plumbing: {
      industry: 'plumbing',
      primaryTypes: [
        'service_call',
        'emergency',
        'quote',
        'installation',
        'repair',
        'maintenance',
      ],
      keywords: {
        service_call: [
          'fix',
          'repair',
          'come out',
          'look at',
          'check',
          'service',
        ],
        emergency: [
          'flooding',
          'burst pipe',
          'no water',
          'leak',
          'urgent',
          'emergency',
        ],
        quote: ['estimate', 'price', 'cost', 'how much', 'quote'],
        installation: ['install', 'put in', 'new', 'replace', 'upgrade'],
        repair: ['broken', 'not working', 'fix', 'repair'],
        maintenance: [
          'tune-up',
          'maintenance',
          'service',
          'check-up',
          'annual',
        ],
      },
      urgencyModifiers: {
        flooding: 2.0,
        emergency: 1.8,
        'no water': 1.6,
        broken: 1.4,
        maintenance: 0.6,
      },
      defaultType: 'service_call',
      emergencyTriggers: [
        'flooding',
        'burst pipe',
        'no water',
        'sewage',
        'gas leak',
      ],
    },

    real_estate: {
      industry: 'real_estate',
      primaryTypes: [
        'showing',
        'meeting',
        'listing_consultation',
        'buyer_consultation',
        'closing',
      ],
      keywords: {
        showing: ['show', 'tour', 'see property', 'walk through', 'visit'],
        listing_consultation: [
          'list',
          'sell',
          'market value',
          'CMA',
          'appraisal',
        ],
        buyer_consultation: ['buy', 'looking for', 'house hunt', 'purchase'],
        meeting: ['meet', 'discuss', 'consultation', 'appointment'],
        closing: ['close', 'settlement', 'final walkthrough'],
      },
      urgencyModifiers: {
        'pre-approved': 1.8,
        'cash buyer': 1.9,
        'closing soon': 1.7,
        'just looking': 0.5,
      },
      defaultType: 'showing',
      emergencyTriggers: [
        'closing tomorrow',
        'offer deadline',
        'contract expiring',
      ],
    },

    legal: {
      industry: 'legal',
      primaryTypes: [
        'legal_consultation',
        'meeting',
        'court_appearance',
        'consultation',
      ],
      keywords: {
        legal_consultation: ['consult', 'legal advice', 'case', 'matter'],
        court_appearance: ['court', 'hearing', 'trial', 'deposition'],
        meeting: ['meet', 'discuss', 'appointment', 'conference'],
        consultation: ['consultation', 'initial', 'evaluation', 'review'],
      },
      urgencyModifiers: {
        'court tomorrow': 2.0,
        deadline: 1.8,
        statute: 1.9,
        arrested: 2.0,
        planning: 0.7,
      },
      defaultType: 'legal_consultation',
      emergencyTriggers: [
        'court',
        'arrested',
        'deadline',
        'statute of limitations',
      ],
    },

    medical: {
      industry: 'medical',
      primaryTypes: [
        'medical_appointment',
        'urgent_care',
        'procedure',
        'wellness_visit',
        'follow_up',
      ],
      keywords: {
        medical_appointment: ['appointment', 'visit', 'see doctor', 'check'],
        urgent_care: ['urgent', "can't wait", 'pain', 'sick', 'emergency'],
        procedure: ['procedure', 'surgery', 'test', 'scan'],
        wellness_visit: ['physical', 'check-up', 'wellness', 'routine'],
        follow_up: ['follow-up', 'recheck', 'test results', 'follow up'],
      },
      urgencyModifiers: {
        'chest pain': 2.0,
        emergency: 2.0,
        'severe pain': 1.9,
        fever: 1.5,
        routine: 0.6,
        wellness: 0.5,
      },
      defaultType: 'medical_appointment',
      emergencyTriggers: [
        'chest pain',
        'breathing',
        'bleeding',
        'overdose',
        'stroke',
      ],
    },

    general: {
      industry: 'general',
      primaryTypes: ['appointment', 'meeting', 'consultation', 'service_call'],
      keywords: {
        appointment: ['appointment', 'visit', 'meet', 'schedule'],
        meeting: ['meeting', 'discuss', 'conference', 'call'],
        consultation: ['consultation', 'advice', 'consult', 'evaluate'],
        service_call: ['service', 'help', 'fix', 'repair', 'work'],
      },
      urgencyModifiers: {
        urgent: 1.5,
        emergency: 1.8,
        routine: 0.7,
        'when convenient': 0.5,
      },
      defaultType: 'appointment',
      emergencyTriggers: ['emergency', 'urgent', 'ASAP', 'right now'],
    },
  };

  /**
   * Classify an event based on extracted content and industry context
   */
  public classifyEvent(
    extractedEvent: Partial<ExtractedEvent>,
    transcriptionText: string,
    industry: string = 'general'
  ): ClassificationResult {
    const rules = this.industryRules[industry] || this.industryRules.general;
    const description = (extractedEvent.description || '').toLowerCase();
    const title = (extractedEvent.title || '').toLowerCase();
    const transcription = transcriptionText.toLowerCase();

    // Score each event type based on keyword matches
    const typeScores: Array<{
      type: EventType;
      score: number;
      matches: string[];
    }> = [];

    for (const eventType of rules.primaryTypes) {
      const keywords = rules.keywords[eventType] || [];
      let score = 0;
      const matches: string[] = [];

      // Check for keyword matches in description, title, and transcription
      for (const keyword of keywords) {
        const keywordLower = keyword.toLowerCase();
        if (description.includes(keywordLower)) {
          score += 3; // Description match is highest weight
          matches.push(keyword);
        } else if (title.includes(keywordLower)) {
          score += 2; // Title match is medium weight
          matches.push(keyword);
        } else if (transcription.includes(keywordLower)) {
          score += 1; // Transcription match is lower weight
          matches.push(keyword);
        }
      }

      // Apply urgency modifiers
      for (const [modifier, multiplier] of Object.entries(
        rules.urgencyModifiers
      )) {
        if (
          description.includes(modifier.toLowerCase()) ||
          title.includes(modifier.toLowerCase()) ||
          transcription.includes(modifier.toLowerCase())
        ) {
          score *= multiplier;
          matches.push(`urgency:${modifier}`);
        }
      }

      if (score > 0) {
        typeScores.push({ type: eventType, score, matches });
      }
    }

    // Sort by score and determine best classification
    typeScores.sort((a, b) => b.score - a.score);

    let selectedType: EventType;
    let confidence: number;
    let reasoning: string;

    if (typeScores.length > 0 && typeScores[0].score > 0) {
      selectedType = typeScores[0].type;

      // Calculate confidence based on score and matches
      const maxPossibleScore = rules.primaryTypes.length * 3; // If all keywords matched in description
      const baseConfidence = Math.min(
        typeScores[0].score / maxPossibleScore,
        1.0
      );

      // Boost confidence for emergency triggers
      let emergencyBoost = 0;
      for (const trigger of rules.emergencyTriggers) {
        if (transcription.includes(trigger.toLowerCase())) {
          emergencyBoost = 0.3;
          break;
        }
      }

      confidence = Math.min(baseConfidence + emergencyBoost, 1.0);
      reasoning = `Classified as ${selectedType} based on keywords: ${typeScores[0].matches.join(', ')}`;

      // Check for emergency classification
      if (emergencyBoost > 0) {
        selectedType = 'emergency';
        confidence = Math.max(confidence, 0.9);
        reasoning += '. Upgraded to emergency due to trigger words.';
      }
    } else {
      selectedType = rules.defaultType;
      confidence = 0.4; // Low confidence for default classification
      reasoning = `No specific keywords found, defaulting to ${selectedType} for ${industry} industry`;
    }

    // Create alternative types list
    const alternativeTypes = typeScores
      .slice(1, 4) // Top 3 alternatives
      .map((score) => ({
        type: score.type,
        confidence: Math.min(score.score / (typeScores[0]?.score || 1), 0.9),
      }));

    return {
      eventType: selectedType,
      confidence,
      reasoning,
      alternativeTypes,
      industryContext: industry,
    };
  }

  /**
   * Validate classification result against extracted event
   */
  public validateClassification(
    classification: ClassificationResult,
    extractedEvent: ExtractedEvent
  ): { valid: boolean; issues: string[]; recommendations: string[] } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for consistency between classification and urgency
    if (
      classification.eventType === 'emergency' &&
      extractedEvent.urgency !== 'emergency'
    ) {
      issues.push(
        'Event classified as emergency but urgency level is not emergency'
      );
      recommendations.push(
        'Consider updating urgency level to match emergency classification'
      );
    }

    // Check confidence vs extracted confidence
    if (classification.confidence > 0.8 && extractedEvent.confidence < 0.6) {
      issues.push(
        'Classification confidence high but extraction confidence low'
      );
      recommendations.push('Review transcription quality and keyword matching');
    }

    // Industry-specific validations
    const rules = this.industryRules[classification.industryContext];
    if (rules && !rules.primaryTypes.includes(classification.eventType)) {
      issues.push(
        `Event type ${classification.eventType} not common for ${rules.industry} industry`
      );
      recommendations.push(
        'Consider alternative classification or review industry context'
      );
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations,
    };
  }

  /**
   * Get industry-specific event types
   */
  public getIndustryEventTypes(industry: string): EventType[] {
    const rules = this.industryRules[industry] || this.industryRules.general;
    return rules.primaryTypes;
  }

  /**
   * Get classification statistics
   */
  public getClassificationStats(classifications: ClassificationResult[]): {
    averageConfidence: number;
    typeDistribution: { [type: string]: number };
    industryBreakdown: { [industry: string]: number };
    lowConfidenceCount: number;
  } {
    const totalClassifications = classifications.length;
    if (totalClassifications === 0) {
      return {
        averageConfidence: 0,
        typeDistribution: {},
        industryBreakdown: {},
        lowConfidenceCount: 0,
      };
    }

    const averageConfidence =
      classifications.reduce((sum, c) => sum + c.confidence, 0) /
      totalClassifications;

    const typeDistribution: { [type: string]: number } = {};
    const industryBreakdown: { [industry: string]: number } = {};
    let lowConfidenceCount = 0;

    for (const classification of classifications) {
      // Type distribution
      typeDistribution[classification.eventType] =
        (typeDistribution[classification.eventType] || 0) + 1;

      // Industry breakdown
      industryBreakdown[classification.industryContext] =
        (industryBreakdown[classification.industryContext] || 0) + 1;

      // Low confidence count
      if (classification.confidence < 0.6) {
        lowConfidenceCount++;
      }
    }

    return {
      averageConfidence,
      typeDistribution,
      industryBreakdown,
      lowConfidenceCount,
    };
  }
}

// Export singleton instance
export const eventClassificationSystem = new EventClassificationSystem();

// Export convenience function
export function classifyEvent(
  extractedEvent: Partial<ExtractedEvent>,
  transcriptionText: string,
  industry: string = 'general'
): ClassificationResult {
  return eventClassificationSystem.classifyEvent(
    extractedEvent,
    transcriptionText,
    industry
  );
}
