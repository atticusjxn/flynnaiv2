import { AIExtractionPipeline } from '@/lib/ai/AIExtractionPipeline'
import { TestDataFactory } from '@/lib/testing/factories'

// Mock OpenAI client
jest.mock('@/lib/openai/client', () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }
}))

describe('AI Extraction Pipeline', () => {
  let aiPipeline: AIExtractionPipeline
  
  beforeEach(() => {
    aiPipeline = new AIExtractionPipeline()
    jest.clearAllMocks()
  })

  describe('Industry-Specific Extraction', () => {
    it('should extract plumbing service calls correctly', async () => {
      const mockOpenAI = require('@/lib/openai/client').openai
      
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              main_topic: 'Kitchen sink leak repair',
              events: [{
                event_type: 'service_call',
                title: 'Kitchen Sink Repair',
                proposed_datetime: '2025-01-16T09:00:00Z',
                location: '456 Pine Street',
                description: 'Fix leaking kitchen sink',
                urgency_level: 'medium',
                ai_confidence: 0.92,
                customer_name: 'Test Customer',
                customer_phone: '+15551234567'
              }]
            })
          }
        }],
        usage: { total_tokens: 150 }
      })

      const transcript = 'My kitchen sink is leaking badly. Can you come fix it tomorrow morning around 9 AM? I live at 456 Pine Street.'
      
      const result = await aiPipeline.extractEvents({
        transcription: transcript,
        industry: 'plumbing',
        user_id: 'user-plumber-1'
      })
      
      expect(result.main_topic).toBe('Kitchen sink leak repair')
      expect(result.events).toHaveLength(1)
      expect(result.events[0].event_type).toBe('service_call')
      expect(result.events[0].urgency_level).toBe('medium')
      expect(result.events[0].location).toBe('456 Pine Street')
    })

    it('should detect emergency situations', async () => {
      const mockOpenAI = require('@/lib/openai/client').openai
      
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              main_topic: 'Basement flooding emergency',
              events: [{
                event_type: 'emergency',
                title: 'Emergency Basement Flooding',
                proposed_datetime: '2025-01-15T11:00:00Z',
                location: '123 Emergency Street',
                description: 'Immediate basement flooding response needed',
                urgency_level: 'emergency',
                ai_confidence: 0.95,
                customer_name: 'Emergency Customer',
                customer_phone: '+15551234567'
              }]
            })
          }
        }],
        usage: { total_tokens: 120 }
      })

      const transcript = 'Emergency! My basement is flooding with water everywhere. I need someone right now!'
      
      const result = await aiPipeline.extractEvents({
        transcription: transcript,
        industry: 'plumbing'
      })
      
      expect(result.events[0].event_type).toBe('emergency')
      expect(result.events[0].urgency_level).toBe('emergency')
      expect(result.events[0].ai_confidence).toBeGreaterThan(0.9)
    })

    it('should handle real estate showings', async () => {
      const mockOpenAI = require('@/lib/openai/client').openai
      
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              main_topic: 'Property showing request - 789 Maple Avenue',
              events: [{
                event_type: 'meeting',
                title: 'Property Showing - 789 Maple Avenue',
                proposed_datetime: null,
                location: '789 Maple Avenue',
                description: 'Customer interested in viewing property',
                urgency_level: 'high',
                follow_up_required: true,
                ai_confidence: 0.88,
                customer_name: 'Potential Buyer',
                customer_phone: '+15559876543'
              }]
            })
          }
        }],
        usage: { total_tokens: 140 }
      })

      const transcript = 'Hi, I saw your listing for 789 Maple Avenue. Could I schedule a showing this Saturday afternoon?'
      
      const result = await aiPipeline.extractEvents({
        transcription: transcript,
        industry: 'real_estate'
      })
      
      expect(result.events[0].title).toContain('789 Maple Avenue')
      expect(result.events[0].event_type).toBe('meeting')
      expect(result.events[0].urgency_level).toBe('high')
    })
  })

  describe('Confidence Scoring', () => {
    it('should assign high confidence to clear requests', async () => {
      const mockOpenAI = require('@/lib/openai/client').openai
      
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              main_topic: 'Scheduled plumbing repair',
              events: [{
                event_type: 'service_call',
                title: 'Sink Repair Appointment',
                proposed_datetime: '2025-01-15T14:00:00Z',
                location: '123 Main Street',
                description: 'Customer scheduled sink repair',
                urgency_level: 'medium',
                ai_confidence: 0.95,
                customer_name: 'John Doe',
                customer_phone: '+15551234567'
              }]
            })
          }
        }],
        usage: { total_tokens: 100 }
      })

      const transcript = 'I need a plumber at 123 Main Street on January 15th at 2 PM for a sink repair.'
      
      const result = await aiPipeline.extractEvents({
        transcription: transcript,
        industry: 'plumbing'
      })
      
      expect(result.events[0].ai_confidence).toBeGreaterThan(0.9)
    })

    it('should assign low confidence to vague requests', async () => {
      const mockOpenAI = require('@/lib/openai/client').openai
      
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              main_topic: 'Vague meeting request',
              events: [{
                event_type: 'meeting',
                title: 'Follow-up Discussion',
                proposed_datetime: null,
                location: null,
                description: 'Unclear request for meeting',
                urgency_level: 'low',
                follow_up_required: true,
                ai_confidence: 0.45,
                customer_name: 'Unknown',
                customer_phone: null
              }]
            })
          }
        }],
        usage: { total_tokens: 80 }
      })

      const transcript = 'Maybe we could meet up sometime to discuss that thing we talked about.'
      
      const result = await aiPipeline.extractEvents({
        transcription: transcript,
        industry: 'sales'
      })
      
      expect(result.events[0].ai_confidence).toBeLessThan(0.6)
      expect(result.events[0].follow_up_required).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle OpenAI API errors gracefully', async () => {
      const mockOpenAI = require('@/lib/openai/client').openai
      
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('OpenAI API Error'))

      const transcript = 'Test transcript'
      
      await expect(aiPipeline.extractEvents({
        transcription: transcript,
        industry: 'plumbing'
      })).rejects.toThrow('OpenAI API Error')
    })

    it('should handle invalid JSON responses', async () => {
      const mockOpenAI = require('@/lib/openai/client').openai
      
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }],
        usage: { total_tokens: 50 }
      })

      const transcript = 'Test transcript'
      
      await expect(aiPipeline.extractEvents({
        transcription: transcript,
        industry: 'plumbing'
      })).rejects.toThrow()
    })
  })
})