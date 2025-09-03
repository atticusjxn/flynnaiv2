// Advanced Confidence Scoring System for Flynn.ai v2
// Multi-factor confidence assessment for AI event extraction

import { ExtractedEvent } from '@/lib/ai/LiveEventExtractor';

export interface ConfidenceFactors {
  // Time information quality
  timeSpecificity: number; // How specific is the proposed datetime
  timeRealism: number; // Is the proposed time realistic/possible

  // Location information quality
  locationCompleteness: number; // How complete is the address/location
  locationRealism: number; // Is the location realistic for the service

  // Customer information quality
  contactCompleteness: number; // How much contact info was captured
  contactRealism: number; // Does the contact info seem realistic

  // Event description quality
  descriptionSpecificity: number; // How specific/detailed is the description
  descriptionRealism: number; // Does the request make sense

  // Industry context alignment
  industryMatch: number; // How well does this fit the industry
  terminologyMatch: number; // Use of industry-specific terms

  // Transcription and source quality
  transcriptionConfidence: number; // Quality of the source transcription
  extractionConsistency: number; // Internal consistency of extraction
}

export interface ConfidenceResult {
  overallConfidence: number;
  factors: ConfidenceFactors;
  breakdown: {
    [factor: string]: { score: number; weight: number; reasoning: string };
  };
  recommendations: string[];
  qualityLevel: 'excellent' | 'good' | 'fair' | 'poor';
}

export class ConfidenceScoring {
  private industryWeights: {
    [industry: string]: { [factor: string]: number };
  } = {
    plumbing: {
      locationCompleteness: 0.25, // Critical for service calls
      contactCompleteness: 0.2, // Need to reach customer
      descriptionSpecificity: 0.15, // Helps with preparation
      timeSpecificity: 0.15, // Scheduling importance
      industryMatch: 0.1, // Industry alignment
      timeRealism: 0.05, // Basic sanity check
      locationRealism: 0.05, // Basic sanity check
      contactRealism: 0.05, // Basic sanity check
    },

    real_estate: {
      locationCompleteness: 0.3, // Property address essential
      contactCompleteness: 0.2, // Customer contact critical
      timeSpecificity: 0.15, // Showing scheduling
      industryMatch: 0.1, // Buyer/seller context
      descriptionSpecificity: 0.1, // Property details
      terminologyMatch: 0.05, // Real estate terms
      timeRealism: 0.05, // Realistic showing times
      locationRealism: 0.05, // Property locations
    },

    legal: {
      contactCompleteness: 0.25, // Client contact essential
      descriptionSpecificity: 0.2, // Legal matter clarity
      timeSpecificity: 0.15, // Deadline sensitivity
      industryMatch: 0.15, // Legal context match
      terminologyMatch: 0.1, // Legal terminology
      timeRealism: 0.1, // Court schedules, etc.
      transcriptionConfidence: 0.05, // Accuracy important
    },

    medical: {
      contactCompleteness: 0.25, // Patient contact essential
      descriptionSpecificity: 0.2, // Symptom/appointment clarity
      timeSpecificity: 0.15, // Appointment scheduling
      industryMatch: 0.15, // Medical context
      timeRealism: 0.1, // Office hours, urgency
      locationCompleteness: 0.1, // Clinic location
      transcriptionConfidence: 0.05, // Medical accuracy
    },

    general: {
      contactCompleteness: 0.2,
      descriptionSpecificity: 0.2,
      timeSpecificity: 0.15,
      locationCompleteness: 0.15,
      industryMatch: 0.1,
      timeRealism: 0.1,
      locationRealism: 0.05,
      contactRealism: 0.05,
    },
  };

  /**
   * Calculate comprehensive confidence score for an extracted event
   */
  public calculateConfidence(
    event: ExtractedEvent,
    transcriptionText: string,
    industry: string = 'general',
    transcriptionConfidence: number = 0.8
  ): ConfidenceResult {
    // Calculate individual confidence factors
    const factors = this.calculateIndividualFactors(
      event,
      transcriptionText,
      transcriptionConfidence
    );

    // Get industry-specific weights
    const weights =
      this.industryWeights[industry] || this.industryWeights.general;

    // Calculate weighted overall confidence
    let overallConfidence = 0;
    const breakdown: {
      [factor: string]: { score: number; weight: number; reasoning: string };
    } = {};

    for (const [factorName, factorValue] of Object.entries(factors)) {
      const weight = weights[factorName] || 0;
      overallConfidence += factorValue * weight;

      breakdown[factorName] = {
        score: factorValue,
        weight: weight,
        reasoning: this.getFactorReasoning(factorName, factorValue, event),
      };
    }

    // Normalize to 0-1 range
    overallConfidence = Math.max(0, Math.min(1, overallConfidence));

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      factors,
      event,
      industry
    );

    // Determine quality level
    const qualityLevel = this.determineQualityLevel(overallConfidence);

    return {
      overallConfidence,
      factors,
      breakdown,
      recommendations,
      qualityLevel,
    };
  }

  /**
   * Calculate individual confidence factors
   */
  private calculateIndividualFactors(
    event: ExtractedEvent,
    transcriptionText: string,
    transcriptionConfidence: number
  ): ConfidenceFactors {
    return {
      timeSpecificity: this.assessTimeSpecificity(event.proposed_datetime),
      timeRealism: this.assessTimeRealism(
        event.proposed_datetime,
        event.urgency
      ),
      locationCompleteness: this.assessLocationCompleteness(event.location),
      locationRealism: this.assessLocationRealism(event.location),
      contactCompleteness: this.assessContactCompleteness(event),
      contactRealism: this.assessContactRealism(event),
      descriptionSpecificity: this.assessDescriptionSpecificity(
        event.description,
        event.title
      ),
      descriptionRealism: this.assessDescriptionRealism(
        event.description,
        event.type
      ),
      industryMatch: this.assessIndustryMatch(event, transcriptionText),
      terminologyMatch: this.assessTerminologyMatch(event, transcriptionText),
      transcriptionConfidence: transcriptionConfidence,
      extractionConsistency: this.assessExtractionConsistency(event),
    };
  }

  /**
   * Time specificity assessment
   */
  private assessTimeSpecificity(proposedDateTime: string | null): number {
    if (!proposedDateTime) return 0.0;

    const dateTimeStr = proposedDateTime.toLowerCase();

    // Specific date and time
    if (dateTimeStr.match(/\d{4}-\d{2}-\d{2}.*\d{2}:\d{2}/)) return 1.0;

    // Specific date, general time
    if (
      dateTimeStr.includes('morning') ||
      dateTimeStr.includes('afternoon') ||
      dateTimeStr.includes('evening')
    ) {
      if (dateTimeStr.match(/\d{4}-\d{2}-\d{2}/)) return 0.8;
    }

    // Relative specific time
    if (
      dateTimeStr.includes('tomorrow') &&
      (dateTimeStr.includes('am') || dateTimeStr.includes('pm'))
    )
      return 0.9;

    // Relative date with general time
    if (dateTimeStr.includes('tomorrow') || dateTimeStr.includes('next week'))
      return 0.6;

    // Very general
    if (dateTimeStr.includes('soon') || dateTimeStr.includes('this week'))
      return 0.4;

    return 0.2; // Has some time reference
  }

  /**
   * Time realism assessment
   */
  private assessTimeRealism(
    proposedDateTime: string | null,
    urgency: string
  ): number {
    if (!proposedDateTime) return 0.5; // Neutral if no time

    const now = new Date();
    const dateTimeStr = proposedDateTime.toLowerCase();

    // Check for impossible times (past dates, unrealistic hours)
    try {
      if (dateTimeStr.match(/\d{4}-\d{2}-\d{2}/)) {
        const dateMatch = dateTimeStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
          const proposedDate = new Date(
            parseInt(dateMatch[1]),
            parseInt(dateMatch[2]) - 1,
            parseInt(dateMatch[3])
          );
          if (proposedDate < now && urgency !== 'emergency') return 0.2; // Past date for non-emergency
        }
      }
    } catch {
      return 0.4; // Invalid date format
    }

    // Emergency urgency should have immediate timing
    if (urgency === 'emergency') {
      if (
        dateTimeStr.includes('now') ||
        dateTimeStr.includes('asap') ||
        dateTimeStr.includes('immediately')
      )
        return 1.0;
      if (dateTimeStr.includes('today')) return 0.8;
      return 0.4; // Emergency but not immediate timing
    }

    return 0.8; // Generally realistic
  }

  /**
   * Location completeness assessment
   */
  private assessLocationCompleteness(location: string | null): number {
    if (!location) return 0.0;

    const loc = location.toLowerCase();

    // Full address with number, street, city
    if (
      loc.match(
        /\d+.*\b(street|st|avenue|ave|drive|dr|road|rd|lane|ln)\b.*\b(city|town)\b/
      )
    )
      return 1.0;

    // Street address with number
    if (loc.match(/\d+.*\b(street|st|avenue|ave|drive|dr|road|rd|lane|ln)\b/))
      return 0.8;

    // Street name without number
    if (loc.match(/\b(street|st|avenue|ave|drive|dr|road|rd|lane|ln)\b/))
      return 0.6;

    // General area/neighborhood
    if (
      loc.match(/\b(downtown|uptown|north|south|east|west|area|neighborhood)\b/)
    )
      return 0.4;

    // Very general
    return 0.2;
  }

  /**
   * Location realism assessment
   */
  private assessLocationRealism(location: string | null): number {
    if (!location) return 0.5; // Neutral if no location

    const loc = location.toLowerCase();

    // Check for obviously fake addresses
    if (
      loc.includes('123 fake') ||
      loc.includes('nowhere') ||
      loc.includes('n/a')
    )
      return 0.1;

    // Check for realistic patterns
    if (loc.match(/\d+\s+\w+\s+(street|st|avenue|ave|drive|dr|road|rd)/))
      return 0.9;

    return 0.7; // Generally realistic
  }

  /**
   * Contact completeness assessment
   */
  private assessContactCompleteness(event: ExtractedEvent): number {
    let score = 0;
    let totalPossible = 3;

    if (event.customer_name && event.customer_name.trim().length > 0)
      score += 1;
    if (event.customer_phone && event.customer_phone.match(/\d{10,}/))
      score += 1;
    if (event.customer_email && event.customer_email.includes('@')) score += 1;

    return score / totalPossible;
  }

  /**
   * Contact realism assessment
   */
  private assessContactRealism(event: ExtractedEvent): number {
    let score = 0;
    let count = 0;

    if (event.customer_name) {
      count++;
      const name = event.customer_name.toLowerCase();
      if (
        name.includes('john doe') ||
        name.includes('test') ||
        name.length < 3
      ) {
        score += 0.2;
      } else {
        score += 0.9;
      }
    }

    if (event.customer_phone) {
      count++;
      const phone = event.customer_phone.replace(/\D/g, '');
      if (phone.length >= 10 && !phone.match(/^(123|000|555)/)) {
        score += 0.9;
      } else {
        score += 0.3;
      }
    }

    if (event.customer_email) {
      count++;
      if (
        event.customer_email.includes('@') &&
        !event.customer_email.includes('test') &&
        !event.customer_email.includes('example')
      ) {
        score += 0.9;
      } else {
        score += 0.3;
      }
    }

    return count > 0 ? score / count : 0.5;
  }

  /**
   * Description specificity assessment
   */
  private assessDescriptionSpecificity(
    description: string,
    title: string
  ): number {
    if (!description) return 0.0;

    const desc = description.toLowerCase();
    const combinedText = `${title || ''} ${description}`.toLowerCase();

    // Very specific with details
    if (
      desc.length > 50 &&
      (desc.includes('because') ||
        desc.includes('when') ||
        desc.includes('where'))
    )
      return 0.9;

    // Good detail level
    if (desc.length > 30) return 0.7;

    // Basic description
    if (desc.length > 15) return 0.5;

    // Minimal description
    if (desc.length > 5) return 0.3;

    return 0.1;
  }

  /**
   * Description realism assessment
   */
  private assessDescriptionRealism(
    description: string,
    eventType: string
  ): number {
    if (!description) return 0.5;

    const desc = description.toLowerCase();

    // Check for generic/template descriptions
    if (
      desc.includes('lorem ipsum') ||
      desc.includes('test description') ||
      desc.includes('placeholder')
    )
      return 0.1;

    // Check for appropriate complexity for event type
    if (eventType === 'emergency' && desc.length < 20) return 0.4; // Emergency should have detail
    if (
      eventType === 'quote' &&
      !desc.includes('price') &&
      !desc.includes('cost') &&
      !desc.includes('estimate')
    )
      return 0.6;

    return 0.8; // Generally realistic
  }

  /**
   * Industry match assessment
   */
  private assessIndustryMatch(
    event: ExtractedEvent,
    transcriptionText: string
  ): number {
    // This would be enhanced with industry-specific keyword matching
    // For now, return a basic assessment based on event type and description
    const desc =
      `${event.title || ''} ${event.description || ''}`.toLowerCase();
    const transcript = transcriptionText.toLowerCase();

    // Look for industry keywords in the combined text
    const allText = `${desc} ${transcript}`;

    // Basic keyword matching (would be expanded with comprehensive lists)
    const plumbingKeywords = [
      'plumb',
      'pipe',
      'leak',
      'drain',
      'water',
      'toilet',
      'sink',
      'faucet',
    ];
    const realEstateKeywords = [
      'house',
      'property',
      'real estate',
      'buy',
      'sell',
      'show',
      'listing',
    ];
    const legalKeywords = [
      'legal',
      'lawyer',
      'attorney',
      'court',
      'lawsuit',
      'consultation',
    ];
    const medicalKeywords = [
      'doctor',
      'appointment',
      'medical',
      'health',
      'symptoms',
      'patient',
    ];

    const keywordSets = [
      plumbingKeywords,
      realEstateKeywords,
      legalKeywords,
      medicalKeywords,
    ];
    let maxMatches = 0;

    for (const keywords of keywordSets) {
      const matches = keywords.filter((keyword) =>
        allText.includes(keyword)
      ).length;
      maxMatches = Math.max(maxMatches, matches);
    }

    return Math.min(maxMatches / 3, 1.0); // Normalize to 0-1
  }

  /**
   * Terminology match assessment
   */
  private assessTerminologyMatch(
    event: ExtractedEvent,
    transcriptionText: string
  ): number {
    // Similar to industry match but focuses on professional terminology usage
    return 0.7; // Placeholder - would be enhanced with terminology dictionaries
  }

  /**
   * Extraction consistency assessment
   */
  private assessExtractionConsistency(event: ExtractedEvent): number {
    let consistencyScore = 1.0;

    // Check for logical consistency
    if (event.urgency === 'emergency' && event.type !== 'emergency') {
      consistencyScore -= 0.3;
    }

    if (event.price_estimate && event.type === 'emergency') {
      consistencyScore -= 0.2; // Emergencies usually don't quote prices
    }

    if (event.proposed_datetime && event.urgency === 'emergency') {
      const dateStr = event.proposed_datetime.toLowerCase();
      if (
        !dateStr.includes('now') &&
        !dateStr.includes('asap') &&
        !dateStr.includes('immediately')
      ) {
        consistencyScore -= 0.3; // Emergency should be immediate
      }
    }

    return Math.max(0, consistencyScore);
  }

  /**
   * Get reasoning for factor score
   */
  private getFactorReasoning(
    factorName: string,
    score: number,
    event: ExtractedEvent
  ): string {
    const scoreCat =
      score > 0.8
        ? 'excellent'
        : score > 0.6
          ? 'good'
          : score > 0.4
            ? 'fair'
            : 'poor';

    switch (factorName) {
      case 'timeSpecificity':
        return `Time specificity is ${scoreCat} - ${event.proposed_datetime ? 'has time reference' : 'missing time information'}`;
      case 'locationCompleteness':
        return `Location detail is ${scoreCat} - ${event.location ? 'has location info' : 'missing location'}`;
      case 'contactCompleteness':
        return `Contact info is ${scoreCat} - captured ${[event.customer_name, event.customer_phone, event.customer_email].filter(Boolean).length}/3 contact fields`;
      case 'descriptionSpecificity':
        return `Description detail is ${scoreCat} - ${event.description ? `${event.description.length} characters` : 'no description'}`;
      default:
        return `${factorName} assessment is ${scoreCat}`;
    }
  }

  /**
   * Generate improvement recommendations
   */
  private generateRecommendations(
    factors: ConfidenceFactors,
    event: ExtractedEvent,
    industry: string
  ): string[] {
    const recommendations: string[] = [];

    if (factors.timeSpecificity < 0.5) {
      recommendations.push(
        'Try to capture more specific timing information from the conversation'
      );
    }

    if (factors.locationCompleteness < 0.6 && industry === 'plumbing') {
      recommendations.push(
        'Service address is critical for plumbing calls - listen for street names or landmarks'
      );
    }

    if (factors.contactCompleteness < 0.7) {
      recommendations.push(
        'Focus on capturing customer name and phone number for follow-up'
      );
    }

    if (factors.descriptionSpecificity < 0.6) {
      recommendations.push(
        'Extract more detailed description of what service is needed'
      );
    }

    if (factors.extractionConsistency < 0.8) {
      recommendations.push(
        'Review extraction for logical consistency between urgency, type, and details'
      );
    }

    return recommendations;
  }

  /**
   * Determine quality level
   */
  private determineQualityLevel(
    confidence: number
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    if (confidence > 0.85) return 'excellent';
    if (confidence > 0.7) return 'good';
    if (confidence > 0.5) return 'fair';
    return 'poor';
  }
}

// Export singleton instance
export const confidenceScoring = new ConfidenceScoring();

// Export convenience function
export function calculateEventConfidence(
  event: ExtractedEvent,
  transcriptionText: string,
  industry: string = 'general',
  transcriptionConfidence: number = 0.8
): ConfidenceResult {
  return confidenceScoring.calculateConfidence(
    event,
    transcriptionText,
    industry,
    transcriptionConfidence
  );
}
