import { GET, POST } from '@/app/api/events/route'
import { NextRequest } from 'next/server'

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email: 'test@example.com'
          }
        }
      })
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn().mockResolvedValue({
              data: [
                {
                  id: 'event-1',
                  title: 'Test Event',
                  event_type: 'service_call',
                  status: 'pending',
                  created_at: '2025-01-15T10:00:00Z'
                }
              ],
              error: null,
              count: 1
            }))
          }))
        }))
      })),
      insert: jest.fn().mockResolvedValue({
        data: [{
          id: 'event-2',
          title: 'New Event',
          event_type: 'service_call',
          status: 'pending'
        }],
        error: null
      })
    }))
  }))
}))

describe('Events API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/events', () => {
    it('should return user events with pagination', async () => {
      const url = new URL('http://localhost:3000/api/events?page=1&limit=20')
      const request = new NextRequest(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.events).toBeInstanceOf(Array)
      expect(data.events).toHaveLength(1)
      expect(data.events[0].title).toBe('Test Event')
    })

    it('should handle unauthorized requests', async () => {
      // Mock unauthorized user
      const { createClient } = require('@/utils/supabase/server')
      const mockClient = createClient()
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Unauthorized' }
      })

      const url = new URL('http://localhost:3000/api/events')
      const request = new NextRequest(url, { method: 'GET' })
      
      const response = await GET(request)
      
      expect(response.status).toBe(401)
    })

    it('should filter events by status', async () => {
      const url = new URL('http://localhost:3000/api/events?status=confirmed')
      const request = new NextRequest(url, { method: 'GET' })
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.events).toBeInstanceOf(Array)
    })

    it('should filter events by urgency level', async () => {
      const url = new URL('http://localhost:3000/api/events?urgency=emergency')
      const request = new NextRequest(url, { method: 'GET' })
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.events).toBeInstanceOf(Array)
    })
  })

  describe('POST /api/events', () => {
    it('should create new event', async () => {
      const eventData = {
        title: 'New Service Call',
        event_type: 'service_call',
        proposed_datetime: '2025-01-17T10:00:00Z',
        location: '789 New Street',
        description: 'Test event creation'
      }

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.event.title).toBe('New Event')
      expect(data.event.event_type).toBe('service_call')
    })

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing required fields
        description: 'Test without required fields'
      }

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidData)
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })

    it('should handle database errors', async () => {
      // Mock database error
      const { createClient } = require('@/utils/supabase/server')
      const mockClient = createClient()
      mockClient.from().insert.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      const eventData = {
        title: 'Test Event',
        event_type: 'service_call',
        proposed_datetime: '2025-01-17T10:00:00Z'
      }

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(500)
    })
  })
})