// AI Extraction Accuracy Testing Framework for Flynn.ai v2
// Test extraction accuracy across different industries to meet 90%+ target

import { liveEventExtractor, ExtractedEvent } from '@/lib/ai/LiveEventExtractor';
import { analyzeMultipleEvents } from '@/lib/ai/MultiEventHandler';

export interface TestCase {
  id: string;
  industry: string;
  transcriptionText: string;
  expectedEvents: Array<{
    type: string;
    title: string;
    urgency: string;
    hasLocation: boolean;
    hasContact: boolean;
    hasDateTime: boolean;
  }>;
  testDescription: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AccuracyResult {
  testId: string;
  passed: boolean;
  accuracy: number;
  extractedEvents: ExtractedEvent[];
  issues: string[];
  improvements: string[];
  processingTime: number;
}

export interface IndustryAccuracy {
  industry: string;
  totalTests: number;
  passedTests: number;
  averageAccuracy: number;
  averageProcessingTime: number;
  commonIssues: string[];
  recommendedImprovements: string[];
}

export class AccuracyTesting {
  
  // Test cases for different industries
  private testCases: TestCase[] = [
    // Plumbing Tests
    {
      id: 'plumb_001',
      industry: 'plumbing',
      transcriptionText: `Hi, I need someone to come out to 123 Oak Street tomorrow morning around 10 AM. My kitchen sink is completely clogged and water is backing up everywhere. This is really urgent. My name is Sarah Johnson and you can reach me at 555-0123.`,
      expectedEvents: [{
        type: 'service_call',
        title: 'Kitchen sink clog repair',
        urgency: 'high',
        hasLocation: true,
        hasContact: true,
        hasDateTime: true
      }],
      testDescription: 'Emergency plumbing with complete information',
      difficulty: 'easy'
    },
    
    {
      id: 'plumb_002',  
      industry: 'plumbing',
      transcriptionText: `Yeah, hi, so my toilet is running constantly and it's driving me crazy. I live on Maple Avenue, house number... hmm... it's 456 I think. Can someone come take a look when they get a chance? Not super urgent. Name's Mike.`,
      expectedEvents: [{
        type: 'service_call',
        title: 'Toilet running repair',
        urgency: 'low',
        hasLocation: true,
        hasContact: true,
        hasDateTime: false
      }],
      testDescription: 'Routine plumbing with partial information',
      difficulty: 'medium'
    },

    {
      id: 'plumb_003',
      industry: 'plumbing',
      transcriptionText: `This is an emergency! My basement is flooding, the pipe burst and there's water everywhere! I need someone here right now! 789 Pine Street, apartment B. Lisa Martinez, 555-9876. Please hurry!`,
      expectedEvents: [{
        type: 'emergency',
        title: 'Burst pipe emergency',
        urgency: 'emergency',
        hasLocation: true,
        hasContact: true,
        hasDateTime: true
      }],
      testDescription: 'Emergency flooding situation',
      difficulty: 'easy'
    },

    // Real Estate Tests
    {
      id: 'real_001',
      industry: 'real_estate',
      transcriptionText: `Hi, I'm interested in seeing the property at 321 Sunset Drive. I'm pre-approved for financing up to $400K and looking to buy soon. Can we schedule a showing tomorrow afternoon? I'm Jennifer Chen, phone is 555-4567.`,
      expectedEvents: [{
        type: 'showing',
        title: 'Property showing',
        urgency: 'high',
        hasLocation: true,
        hasContact: true,
        hasDateTime: true
      }],
      testDescription: 'Qualified buyer property showing',
      difficulty: 'easy'
    },

    {
      id: 'real_002',
      industry: 'real_estate',
      transcriptionText: `I'm thinking about maybe selling my house and want to know what it might be worth. I live at 654 Elm Road. No rush, just exploring options. This is Tom.`,
      expectedEvents: [{
        type: 'listing_consultation',
        title: 'Home value consultation',
        urgency: 'low',
        hasLocation: true,
        hasContact: true,
        hasDateTime: false
      }],
      testDescription: 'Potential seller inquiry',
      difficulty: 'medium'
    },

    // Legal Tests
    {
      id: 'legal_001',
      industry: 'legal',
      transcriptionText: `I need to speak with an attorney immediately. I have court tomorrow morning and my lawyer just dropped my case. This is about a custody matter. My name is David Wilson, 555-2468. This is urgent.`,
      expectedEvents: [{
        type: 'legal_consultation',
        title: 'Emergency custody consultation',
        urgency: 'emergency',
        hasLocation: false,
        hasContact: true,
        hasDateTime: true
      }],
      testDescription: 'Emergency legal consultation',
      difficulty: 'medium'
    },

    {
      id: 'legal_002',
      industry: 'legal',
      transcriptionText: `Hi, I was in a car accident last week and I think I need a lawyer. The other driver's insurance is giving me trouble. Can I set up a consultation sometime this week? Amanda Rodriguez, 555-7890.`,
      expectedEvents: [{
        type: 'legal_consultation',
        title: 'Car accident consultation',
        urgency: 'medium',
        hasLocation: false,
        hasContact: true,
        hasDateTime: true
      }],
      testDescription: 'Personal injury consultation',
      difficulty: 'easy'
    },

    // Medical Tests
    {
      id: 'med_001',
      industry: 'medical',
      transcriptionText: `I need to make an appointment for next week. I've been having headaches and my doctor wants me to come in for a follow-up. Tuesday or Wednesday would work best. This is Patricia Smith, 555-3456.`,
      expectedEvents: [{
        type: 'follow_up',
        title: 'Headache follow-up appointment',
        urgency: 'medium',
        hasLocation: false,
        hasContact: true,
        hasDateTime: true
      }],
      testDescription: 'Routine medical follow-up',
      difficulty: 'easy'
    },

    {
      id: 'med_002',
      industry: 'medical',
      transcriptionText: `I'm having severe chest pain and shortness of breath. I need to be seen right away. Should I come to the office or go to the emergency room? This is Robert Brown, 555-6789.`,
      expectedEvents: [{
        type: 'urgent_care',
        title: 'Chest pain urgent evaluation',
        urgency: 'emergency',
        hasLocation: false,
        hasContact: true,
        hasDateTime: true
      }],
      testDescription: 'Emergency medical symptoms',
      difficulty: 'medium'
    },

    // Multiple Event Tests
    {
      id: 'multi_001',
      industry: 'plumbing',
      transcriptionText: `Hi, I need two things done. First, my kitchen faucet is dripping and needs to be fixed. Then while you're there, can you also look at installing a new garbage disposal? Both at 147 Oak Avenue. This is Carol, 555-1357. Next week would be fine.`,
      expectedEvents: [{
        type: 'service_call',
        title: 'Faucet repair',
        urgency: 'low',
        hasLocation: true,
        hasContact: true,
        hasDateTime: true
      }, {
        type: 'installation',
        title: 'Garbage disposal installation',
        urgency: 'low',
        hasLocation: true,
        hasContact: true,
        hasDateTime: true
      }],
      testDescription: 'Multiple plumbing services combined',
      difficulty: 'hard'
    }
  ];

  /**
   * Run accuracy test for a specific industry
   */
  public async testIndustryAccuracy(industry: string): Promise<IndustryAccuracy> {
    const industryTests = this.testCases.filter(test => test.industry === industry);
    const results: AccuracyResult[] = [];
    
    console.log(`Running ${industryTests.length} tests for ${industry} industry...`);
    
    for (const testCase of industryTests) {
      const result = await this.runSingleTest(testCase);
      results.push(result);
      console.log(`Test ${testCase.id}: ${result.passed ? 'PASSED' : 'FAILED'} (${(result.accuracy * 100).toFixed(1)}% accuracy)`);
    }
    
    // Calculate industry statistics
    const passedTests = results.filter(r => r.passed).length;
    const averageAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
    const averageProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / results.length;
    
    // Collect common issues
    const allIssues = results.flatMap(r => r.issues);
    const issueFrequency = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    const commonIssues = Object.entries(issueFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue]) => issue);
    
    // Collect improvement recommendations
    const allImprovements = results.flatMap(r => r.improvements);
    const uniqueImprovements = [...new Set(allImprovements)];
    
    return {
      industry,
      totalTests: results.length,
      passedTests,
      averageAccuracy,
      averageProcessingTime,
      commonIssues,
      recommendedImprovements: uniqueImprovements.slice(0, 5)
    };
  }

  /**
   * Run all accuracy tests across all industries
   */
  public async runAllAccuracyTests(): Promise<{
    overallAccuracy: number;
    industryResults: IndustryAccuracy[];
    summary: {
      totalTests: number;
      totalPassed: number;
      averageProcessingTime: number;
      meetsTarget: boolean;
    };
  }> {
    const industries = [...new Set(this.testCases.map(t => t.industry))];
    const industryResults: IndustryAccuracy[] = [];
    
    console.log('Starting comprehensive accuracy testing...');
    
    for (const industry of industries) {
      const result = await this.testIndustryAccuracy(industry);
      industryResults.push(result);
    }
    
    // Calculate overall statistics
    const totalTests = industryResults.reduce((sum, r) => sum + r.totalTests, 0);
    const totalPassed = industryResults.reduce((sum, r) => sum + r.passedTests, 0);
    const overallAccuracy = industryResults.reduce((sum, r) => sum + r.averageAccuracy * r.totalTests, 0) / totalTests;
    const averageProcessingTime = industryResults.reduce((sum, r) => sum + r.averageProcessingTime * r.totalTests, 0) / totalTests;
    
    const meetsTarget = overallAccuracy >= 0.90; // 90% accuracy target
    
    console.log('\n=== ACCURACY TEST RESULTS ===');
    console.log(`Overall Accuracy: ${(overallAccuracy * 100).toFixed(1)}%`);
    console.log(`Target Met: ${meetsTarget ? 'YES' : 'NO'} (target: 90%)`);
    console.log(`Total Tests: ${totalTests}, Passed: ${totalPassed}`);
    console.log(`Average Processing Time: ${averageProcessingTime.toFixed(0)}ms`);
    
    return {
      overallAccuracy,
      industryResults,
      summary: {
        totalTests,
        totalPassed,
        averageProcessingTime,
        meetsTarget
      }
    };
  }

  /**
   * Run a single accuracy test
   */
  private async runSingleTest(testCase: TestCase): Promise<AccuracyResult> {
    const startTime = Date.now();
    
    try {
      // Run the extraction
      const result = await liveEventExtractor.extractEventsFromLiveTranscription(
        `test_${testCase.id}`,
        testCase.transcriptionText,
        testCase.industry,
        0.8
      );
      
      const processingTime = Date.now() - startTime;
      const extractedEvents = result.events;
      
      // Analyze multiple events if applicable
      let multiEventAnalysis = null;
      if (extractedEvents.length > 1) {
        multiEventAnalysis = analyzeMultipleEvents(
          extractedEvents,
          testCase.transcriptionText,
          testCase.industry,
          `test_${testCase.id}`
        );
      }
      
      // Calculate accuracy score
      const { accuracy, issues, improvements } = this.calculateTestAccuracy(
        testCase, 
        extractedEvents, 
        multiEventAnalysis
      );
      
      const passed = accuracy >= 0.80; // 80% threshold for individual tests
      
      return {
        testId: testCase.id,
        passed,
        accuracy,
        extractedEvents,
        issues,
        improvements,
        processingTime
      };
      
    } catch (error) {
      return {
        testId: testCase.id,
        passed: false,
        accuracy: 0,
        extractedEvents: [],
        issues: [`Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        improvements: ['Fix extraction pipeline error handling'],
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Calculate accuracy score for a test
   */
  private calculateTestAccuracy(
    testCase: TestCase,
    extractedEvents: ExtractedEvent[],
    multiEventAnalysis: any
  ): { accuracy: number; issues: string[]; improvements: string[] } {
    
    const issues: string[] = [];
    const improvements: string[] = [];
    let totalScore = 0;
    let maxScore = 0;
    
    const expectedCount = testCase.expectedEvents.length;
    const actualCount = extractedEvents.length;
    
    // Event count accuracy (20% of score)
    maxScore += 20;
    if (actualCount === expectedCount) {
      totalScore += 20;
    } else if (actualCount > 0) {
      const countAccuracy = Math.min(actualCount, expectedCount) / Math.max(actualCount, expectedCount);
      totalScore += countAccuracy * 20;
      if (actualCount < expectedCount) {
        issues.push('Missing expected events');
        improvements.push('Improve event detection sensitivity');
      } else {
        issues.push('Extracted too many events');
        improvements.push('Improve event deduplication');
      }
    } else {
      issues.push('No events extracted');
      improvements.push('Review extraction prompts and thresholds');
    }
    
    // For each expected event, find best match and score it
    for (let i = 0; i < expectedCount; i++) {
      const expected = testCase.expectedEvents[i];
      maxScore += 80; // Each event worth 80 points (distributed across criteria)
      
      // Find best matching extracted event
      let bestMatch: ExtractedEvent | null = null;
      let bestMatchScore = 0;
      
      for (const extracted of extractedEvents) {
        const score = this.scoreEventMatch(expected, extracted);
        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatch = extracted;
        }
      }
      
      if (bestMatch) {
        totalScore += bestMatchScore;
        
        // Detailed scoring breakdown
        if (bestMatchScore < 60) {
          issues.push(`Poor match for expected event ${i + 1}`);
          improvements.push('Improve event classification accuracy');
        }
        
        // Check specific requirements
        if (expected.hasLocation && !bestMatch.location) {
          issues.push(`Missing location for ${expected.title}`);
          improvements.push('Improve location extraction');
        }
        
        if (expected.hasContact && !bestMatch.customer_name && !bestMatch.customer_phone) {
          issues.push(`Missing contact info for ${expected.title}`);
          improvements.push('Improve contact information extraction');
        }
        
        if (expected.hasDateTime && !bestMatch.proposed_datetime) {
          issues.push(`Missing datetime for ${expected.title}`);
          improvements.push('Improve time/date extraction');
        }
        
        if (expected.urgency !== bestMatch.urgency) {
          issues.push(`Incorrect urgency: expected ${expected.urgency}, got ${bestMatch.urgency}`);
          improvements.push('Improve urgency classification');
        }
        
      } else {
        issues.push(`No match found for expected event: ${expected.title}`);
        improvements.push('Improve event detection and matching');
      }
    }
    
    const accuracy = maxScore > 0 ? totalScore / maxScore : 0;
    
    return { accuracy, issues, improvements };
  }

  /**
   * Score how well an extracted event matches an expected event
   */
  private scoreEventMatch(expected: any, extracted: ExtractedEvent): number {
    let score = 0;
    
    // Event type match (30 points)
    if (extracted.type === expected.type || 
        (expected.type === 'service_call' && ['repair', 'installation', 'maintenance'].includes(extracted.type))) {
      score += 30;
    } else if (this.isRelatedEventType(expected.type, extracted.type)) {
      score += 20;
    }
    
    // Urgency match (20 points)
    if (extracted.urgency === expected.urgency) {
      score += 20;
    } else if (this.isRelatedUrgency(expected.urgency, extracted.urgency)) {
      score += 10;
    }
    
    // Required fields (30 points total - 10 each)
    if (expected.hasLocation) {
      if (extracted.location && extracted.location.length > 5) score += 10;
    } else {
      score += 10; // No location required, so full points
    }
    
    if (expected.hasContact) {
      if (extracted.customer_name || extracted.customer_phone) score += 10;
    } else {
      score += 10; // No contact required, so full points
    }
    
    if (expected.hasDateTime) {
      if (extracted.proposed_datetime) score += 10;
    } else {
      score += 10; // No datetime required, so full points
    }
    
    // Title/description relevance (20 points)
    const titleMatch = this.calculateStringRelevance(expected.title, extracted.title);
    const descMatch = this.calculateStringRelevance(expected.title, extracted.description);
    const bestMatch = Math.max(titleMatch, descMatch);
    score += bestMatch * 20;
    
    return score;
  }

  /**
   * Check if event types are related
   */
  private isRelatedEventType(expected: string, actual: string): boolean {
    const relatedTypes: { [key: string]: string[] } = {
      'service_call': ['repair', 'installation', 'maintenance', 'quote'],
      'appointment': ['consultation', 'meeting', 'follow_up'],
      'emergency': ['urgent_care', 'service_call'],
      'showing': ['meeting', 'appointment']
    };
    
    return relatedTypes[expected]?.includes(actual) || false;
  }

  /**
   * Check if urgency levels are related
   */
  private isRelatedUrgency(expected: string, actual: string): boolean {
    const urgencyGroups = [
      ['emergency', 'high'],
      ['high', 'medium'], 
      ['medium', 'low']
    ];
    
    return urgencyGroups.some(group => 
      group.includes(expected) && group.includes(actual)
    );
  }

  /**
   * Calculate string relevance (simple keyword overlap)
   */
  private calculateStringRelevance(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => 
      word.length > 2 && words2.includes(word)
    );
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }
}

// Export singleton instance
export const accuracyTesting = new AccuracyTesting();

// Export convenience functions
export async function testIndustryAccuracy(industry: string): Promise<IndustryAccuracy> {
  return await accuracyTesting.testIndustryAccuracy(industry);
}

export async function runAllAccuracyTests() {
  return await accuracyTesting.runAllAccuracyTests();
}