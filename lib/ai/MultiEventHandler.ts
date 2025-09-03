// Multiple Event Handler for Flynn.ai v2
// Advanced handling of multiple appointments and requests within a single call

import {
  ExtractedEvent,
  LiveExtractionResult,
} from '@/lib/ai/LiveEventExtractor';
import {
  classifyEvent,
  EventClassificationSystem,
} from '@/lib/ai/EventClassificationSystem';
import { calculateEventConfidence } from '@/lib/ai/ConfidenceScoring';

export interface EventCluster {
  primaryEvent: ExtractedEvent;
  relatedEvents: ExtractedEvent[];
  clusterType: 'single' | 'sequence' | 'alternatives' | 'combined_service';
  confidence: number;
  reasoning: string;
}

export interface MultiEventAnalysis {
  totalEvents: number;
  eventClusters: EventCluster[];
  recommendedAction:
    | 'single_appointment'
    | 'multiple_appointments'
    | 'follow_up_call'
    | 'clarification_needed';
  prioritization: Array<{
    event: ExtractedEvent;
    priority: number;
    reasoning: string;
  }>;
  conflicts: Array<{
    event1: ExtractedEvent;
    event2: ExtractedEvent;
    conflictType: string;
    resolution: string;
  }>;
  overallConfidence: number;
}

export class MultiEventHandler {
  private eventClassificationSystem = new EventClassificationSystem();

  /**
   * Analyze and process multiple events from a single call
   */
  public analyzeMultipleEvents(
    events: ExtractedEvent[],
    transcriptionText: string,
    industry: string,
    callSid: string
  ): MultiEventAnalysis {
    if (events.length === 0) {
      return this.createEmptyAnalysis();
    }

    if (events.length === 1) {
      return this.createSingleEventAnalysis(
        events[0],
        transcriptionText,
        industry
      );
    }

    // Cluster related events
    const eventClusters = this.clusterEvents(
      events,
      transcriptionText,
      industry
    );

    // Prioritize events by urgency and importance
    const prioritization = this.prioritizeEvents(events, industry);

    // Detect conflicts between events
    const conflicts = this.detectEventConflicts(events);

    // Determine recommended action
    const recommendedAction = this.determineRecommendedAction(
      eventClusters,
      conflicts,
      industry
    );

    // Calculate overall confidence
    const overallConfidence = this.calculateOverallConfidence(
      events,
      eventClusters
    );

    return {
      totalEvents: events.length,
      eventClusters,
      recommendedAction,
      prioritization,
      conflicts,
      overallConfidence,
    };
  }

  /**
   * Cluster related events together
   */
  private clusterEvents(
    events: ExtractedEvent[],
    transcriptionText: string,
    industry: string
  ): EventCluster[] {
    const clusters: EventCluster[] = [];
    const processedEvents = new Set<number>();

    for (let i = 0; i < events.length; i++) {
      if (processedEvents.has(i)) continue;

      const primaryEvent = events[i];
      const relatedEvents: ExtractedEvent[] = [];

      // Find related events
      for (let j = i + 1; j < events.length; j++) {
        if (processedEvents.has(j)) continue;

        const secondaryEvent = events[j];
        const relationship = this.analyzeEventRelationship(
          primaryEvent,
          secondaryEvent,
          industry
        );

        if (relationship.isRelated) {
          relatedEvents.push(secondaryEvent);
          processedEvents.add(j);
        }
      }

      // Determine cluster type
      const clusterType = this.determineClusterType(
        primaryEvent,
        relatedEvents,
        transcriptionText
      );

      // Calculate cluster confidence
      const confidence = this.calculateClusterConfidence(
        primaryEvent,
        relatedEvents
      );

      const reasoning = this.generateClusterReasoning(
        clusterType,
        primaryEvent,
        relatedEvents
      );

      clusters.push({
        primaryEvent,
        relatedEvents,
        clusterType,
        confidence,
        reasoning,
      });

      processedEvents.add(i);
    }

    return clusters;
  }

  /**
   * Analyze relationship between two events
   */
  private analyzeEventRelationship(
    event1: ExtractedEvent,
    event2: ExtractedEvent,
    industry: string
  ): {
    isRelated: boolean;
    relationshipType:
      | 'duplicate'
      | 'sequence'
      | 'alternative'
      | 'complementary'
      | 'unrelated';
    confidence: number;
  } {
    // Check for duplicates (same event extracted multiple times)
    if (this.areEventsDuplicate(event1, event2)) {
      return {
        isRelated: true,
        relationshipType: 'duplicate',
        confidence: 0.9,
      };
    }

    // Check for sequential events (follow-up, multi-step service)
    if (this.areEventsSequential(event1, event2, industry)) {
      return { isRelated: true, relationshipType: 'sequence', confidence: 0.8 };
    }

    // Check for alternatives (customer considering multiple options)
    if (this.areEventsAlternative(event1, event2)) {
      return {
        isRelated: true,
        relationshipType: 'alternative',
        confidence: 0.7,
      };
    }

    // Check for complementary services
    if (this.areEventsComplementary(event1, event2, industry)) {
      return {
        isRelated: true,
        relationshipType: 'complementary',
        confidence: 0.6,
      };
    }

    return { isRelated: false, relationshipType: 'unrelated', confidence: 0.1 };
  }

  /**
   * Check if events are duplicates
   */
  private areEventsDuplicate(
    event1: ExtractedEvent,
    event2: ExtractedEvent
  ): boolean {
    // Similar titles and descriptions
    const titleSimilarity = this.calculateStringSimilarity(
      event1.title,
      event2.title
    );
    const descriptionSimilarity = this.calculateStringSimilarity(
      event1.description,
      event2.description
    );

    // Same location and time
    const sameLocation =
      event1.location && event2.location && event1.location === event2.location;
    const sameTime =
      event1.proposed_datetime &&
      event2.proposed_datetime &&
      event1.proposed_datetime === event2.proposed_datetime;

    return (
      (titleSimilarity > 0.8 || descriptionSimilarity > 0.8) &&
      (sameLocation || sameTime)
    );
  }

  /**
   * Check if events are sequential
   */
  private areEventsSequential(
    event1: ExtractedEvent,
    event2: ExtractedEvent,
    industry: string
  ): boolean {
    const combinedDescription =
      `${event1.description} ${event2.description}`.toLowerCase();

    // Look for sequential indicators
    const sequentialKeywords = [
      'first',
      'then',
      'after',
      'follow-up',
      'second visit',
      'next step',
      'initial',
      'later',
      'subsequent',
      'return visit',
      'check back',
    ];

    const hasSequentialKeywords = sequentialKeywords.some((keyword) =>
      combinedDescription.includes(keyword)
    );

    // Industry-specific sequential patterns
    if (industry === 'plumbing') {
      const plumbingSequential = [
        'inspect',
        'quote',
        'install',
        'follow-up',
        'warranty',
      ];
      return (
        hasSequentialKeywords ||
        plumbingSequential.some((keyword) =>
          combinedDescription.includes(keyword)
        )
      );
    }

    if (industry === 'medical') {
      const medicalSequential = [
        'consultation',
        'test',
        'results',
        'treatment',
        'follow-up',
      ];
      return (
        hasSequentialKeywords ||
        medicalSequential.some((keyword) =>
          combinedDescription.includes(keyword)
        )
      );
    }

    return hasSequentialKeywords;
  }

  /**
   * Check if events are alternatives
   */
  private areEventsAlternative(
    event1: ExtractedEvent,
    event2: ExtractedEvent
  ): boolean {
    const combinedText =
      `${event1.title} ${event1.description} ${event2.title} ${event2.description}`.toLowerCase();

    const alternativeKeywords = [
      'or',
      'either',
      'maybe',
      'option',
      'choice',
      'alternatively',
      'if not',
      'otherwise',
      'instead',
      'preference',
    ];

    return alternativeKeywords.some((keyword) =>
      combinedText.includes(keyword)
    );
  }

  /**
   * Check if events are complementary
   */
  private areEventsComplementary(
    event1: ExtractedEvent,
    event2: ExtractedEvent,
    industry: string
  ): boolean {
    if (industry === 'plumbing') {
      const service1 =
        event1.service_type?.toLowerCase() || event1.description.toLowerCase();
      const service2 =
        event2.service_type?.toLowerCase() || event2.description.toLowerCase();

      // Common complementary plumbing services
      const complementaryPairs = [
        ['drain', 'pipe'],
        ['faucet', 'sink'],
        ['toilet', 'bathroom'],
        ['water heater', 'plumbing'],
        ['leak', 'repair'],
      ];

      return complementaryPairs.some(
        (pair) =>
          (service1.includes(pair[0]) && service2.includes(pair[1])) ||
          (service1.includes(pair[1]) && service2.includes(pair[0]))
      );
    }

    return false;
  }

  /**
   * Calculate string similarity using simple character overlap
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1.0;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.calculateEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate edit distance between two strings
   */
  private calculateEditDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Determine cluster type based on events
   */
  private determineClusterType(
    primaryEvent: ExtractedEvent,
    relatedEvents: ExtractedEvent[],
    transcriptionText: string
  ): 'single' | 'sequence' | 'alternatives' | 'combined_service' {
    if (relatedEvents.length === 0) return 'single';

    const transcript = transcriptionText.toLowerCase();

    // Check for alternative language
    if (
      transcript.includes(' or ') ||
      transcript.includes('either') ||
      transcript.includes('maybe')
    ) {
      return 'alternatives';
    }

    // Check for sequential language
    if (
      transcript.includes('first') ||
      transcript.includes('then') ||
      transcript.includes('after')
    ) {
      return 'sequence';
    }

    // Check for combined service indicators
    if (
      transcript.includes('and also') ||
      transcript.includes("while you're there") ||
      transcript.includes('at the same time')
    ) {
      return 'combined_service';
    }

    return 'combined_service'; // Default for multiple related events
  }

  /**
   * Calculate confidence for event cluster
   */
  private calculateClusterConfidence(
    primaryEvent: ExtractedEvent,
    relatedEvents: ExtractedEvent[]
  ): number {
    const allEvents = [primaryEvent, ...relatedEvents];
    const totalConfidence = allEvents.reduce(
      (sum, event) => sum + event.confidence,
      0
    );
    const averageConfidence = totalConfidence / allEvents.length;

    // Reduce confidence for complex clusters
    const complexityPenalty = Math.max(0, (relatedEvents.length - 1) * 0.1);

    return Math.max(0.1, averageConfidence - complexityPenalty);
  }

  /**
   * Generate reasoning for cluster
   */
  private generateClusterReasoning(
    clusterType: string,
    primaryEvent: ExtractedEvent,
    relatedEvents: ExtractedEvent[]
  ): string {
    switch (clusterType) {
      case 'single':
        return `Single ${primaryEvent.type} appointment identified`;
      case 'sequence':
        return `Sequential appointments: ${primaryEvent.type} followed by ${relatedEvents.length} related service(s)`;
      case 'alternatives':
        return `Customer considering ${relatedEvents.length + 1} alternative options for ${primaryEvent.type}`;
      case 'combined_service':
        return `Combined service request: ${primaryEvent.type} with ${relatedEvents.length} additional service(s)`;
      default:
        return `Cluster of ${relatedEvents.length + 1} related events`;
    }
  }

  /**
   * Prioritize events by importance and urgency
   */
  private prioritizeEvents(
    events: ExtractedEvent[],
    industry: string
  ): Array<{ event: ExtractedEvent; priority: number; reasoning: string }> {
    const prioritized = events.map((event) => {
      let priority = 0;
      const reasons: string[] = [];

      // Urgency factor (highest weight)
      switch (event.urgency) {
        case 'emergency':
          priority += 100;
          reasons.push('emergency urgency');
          break;
        case 'high':
          priority += 75;
          reasons.push('high urgency');
          break;
        case 'medium':
          priority += 50;
          reasons.push('medium urgency');
          break;
        case 'low':
          priority += 25;
          reasons.push('low urgency');
          break;
      }

      // Confidence factor
      priority += event.confidence * 20;
      if (event.confidence > 0.8) reasons.push('high confidence');

      // Contact information completeness
      const contactScore = [
        event.customer_name,
        event.customer_phone,
        event.customer_email,
      ].filter(Boolean).length;
      priority += contactScore * 5;
      if (contactScore >= 2) reasons.push('good contact info');

      // Industry-specific factors
      if (industry === 'plumbing' && event.location) {
        priority += 15;
        reasons.push('has service address');
      }

      if (industry === 'real_estate' && event.location) {
        priority += 20;
        reasons.push('has property address');
      }

      if (industry === 'legal' && event.proposed_datetime) {
        priority += 15;
        reasons.push('has timing info');
      }

      return {
        event,
        priority,
        reasoning: reasons.join(', '),
      };
    });

    return prioritized.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Detect conflicts between events
   */
  private detectEventConflicts(
    events: ExtractedEvent[]
  ): Array<{
    event1: ExtractedEvent;
    event2: ExtractedEvent;
    conflictType: string;
    resolution: string;
  }> {
    const conflicts = [];

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const event1 = events[i];
        const event2 = events[j];

        // Time conflict
        if (
          event1.proposed_datetime &&
          event2.proposed_datetime &&
          event1.proposed_datetime === event2.proposed_datetime
        ) {
          conflicts.push({
            event1,
            event2,
            conflictType: 'timing',
            resolution:
              'Schedule events at different times or combine if related',
          });
        }

        // Location conflict (same address, different services)
        if (
          event1.location &&
          event2.location &&
          event1.location === event2.location &&
          event1.service_type !== event2.service_type
        ) {
          conflicts.push({
            event1,
            event2,
            conflictType: 'location',
            resolution: 'Consider combining services into single visit',
          });
        }

        // Customer conflict (different names, same phone)
        if (
          event1.customer_name &&
          event2.customer_name &&
          event1.customer_name !== event2.customer_name &&
          event1.customer_phone === event2.customer_phone
        ) {
          conflicts.push({
            event1,
            event2,
            conflictType: 'customer_identity',
            resolution: 'Clarify if same customer or different family members',
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Determine recommended action for multiple events
   */
  private determineRecommendedAction(
    clusters: EventCluster[],
    conflicts: any[],
    industry: string
  ):
    | 'single_appointment'
    | 'multiple_appointments'
    | 'follow_up_call'
    | 'clarification_needed' {
    if (clusters.length === 0) return 'clarification_needed';
    if (clusters.length === 1 && clusters[0].relatedEvents.length === 0)
      return 'single_appointment';

    // Check for conflicts that need clarification
    if (conflicts.length > 0) {
      const seriousConflicts = conflicts.filter(
        (c) =>
          c.conflictType === 'timing' || c.conflictType === 'customer_identity'
      );
      if (seriousConflicts.length > 0) return 'clarification_needed';
    }

    // Check cluster types
    const hasAlternatives = clusters.some(
      (c) => c.clusterType === 'alternatives'
    );
    if (hasAlternatives) return 'follow_up_call';

    const hasSequential = clusters.some((c) => c.clusterType === 'sequence');
    const hasCombined = clusters.some(
      (c) => c.clusterType === 'combined_service'
    );

    if (hasSequential) return 'multiple_appointments';
    if (hasCombined && industry === 'plumbing') return 'single_appointment'; // Can combine plumbing services

    return 'multiple_appointments';
  }

  /**
   * Calculate overall confidence across all events
   */
  private calculateOverallConfidence(
    events: ExtractedEvent[],
    clusters: EventCluster[]
  ): number {
    if (events.length === 0) return 0;

    const eventConfidences = events.map((e) => e.confidence);
    const averageEventConfidence =
      eventConfidences.reduce((sum, c) => sum + c, 0) / events.length;

    const clusterConfidences = clusters.map((c) => c.confidence);
    const averageClusterConfidence =
      clusterConfidences.length > 0
        ? clusterConfidences.reduce((sum, c) => sum + c, 0) /
          clusterConfidences.length
        : 1.0;

    // Weight both factors
    return averageEventConfidence * 0.7 + averageClusterConfidence * 0.3;
  }

  /**
   * Create empty analysis
   */
  private createEmptyAnalysis(): MultiEventAnalysis {
    return {
      totalEvents: 0,
      eventClusters: [],
      recommendedAction: 'clarification_needed',
      prioritization: [],
      conflicts: [],
      overallConfidence: 0,
    };
  }

  /**
   * Create single event analysis
   */
  private createSingleEventAnalysis(
    event: ExtractedEvent,
    transcriptionText: string,
    industry: string
  ): MultiEventAnalysis {
    const cluster: EventCluster = {
      primaryEvent: event,
      relatedEvents: [],
      clusterType: 'single',
      confidence: event.confidence,
      reasoning: `Single ${event.type} appointment identified`,
    };

    const priority = {
      event,
      priority:
        event.urgency === 'emergency'
          ? 100
          : event.urgency === 'high'
            ? 75
            : event.urgency === 'medium'
              ? 50
              : 25,
      reasoning: `${event.urgency} urgency level`,
    };

    return {
      totalEvents: 1,
      eventClusters: [cluster],
      recommendedAction: 'single_appointment',
      prioritization: [priority],
      conflicts: [],
      overallConfidence: event.confidence,
    };
  }
}

// Export singleton instance
export const multiEventHandler = new MultiEventHandler();

// Export convenience function
export function analyzeMultipleEvents(
  events: ExtractedEvent[],
  transcriptionText: string,
  industry: string,
  callSid: string
): MultiEventAnalysis {
  return multiEventHandler.analyzeMultipleEvents(
    events,
    transcriptionText,
    industry,
    callSid
  );
}
