// Flynn.ai v2 - Analytics Database Operations
import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types/database.types';

type Call = Database['public']['Tables']['calls']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type CommunicationLog = Database['public']['Tables']['communication_logs']['Row'];

export class AnalyticsService {
  private supabase = createClient();

  async getDashboardStats(userId: string) {
    // Get basic counts in parallel
    const [callsResult, eventsResult, pendingEventsResult] = await Promise.all([
      this.supabase
        .from('calls')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      
      this.supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      
      this.supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending'),
    ]);

    // Get recent activity
    const { data: recentCalls } = await this.supabase
      .from('calls')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentEvents } = await this.supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      totalCalls: callsResult.count || 0,
      totalEvents: eventsResult.count || 0,
      pendingEvents: pendingEventsResult.count || 0,
      recentCalls: recentCalls || [],
      recentEvents: recentEvents || [],
    };
  }

  async getCallProcessingMetrics(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: calls } = await this.supabase
      .from('calls')
      .select('created_at, ai_processing_status, processed_at, email_sent_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (!calls) return null;

    // Calculate processing times and success rates
    const processedCalls = calls.filter(call => 
      call.ai_processing_status === 'completed' && call.processed_at
    );

    const processingTimes = processedCalls.map(call => {
      const start = new Date(call.created_at);
      const end = new Date(call.processed_at!);
      return end.getTime() - start.getTime();
    });

    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;

    const successRate = calls.length > 0
      ? (processedCalls.length / calls.length) * 100
      : 0;

    const emailsSent = calls.filter(call => call.email_sent_at).length;
    const emailDeliveryRate = calls.length > 0
      ? (emailsSent / calls.length) * 100
      : 0;

    return {
      totalCalls: calls.length,
      processedCalls: processedCalls.length,
      successRate: Math.round(successRate * 100) / 100,
      averageProcessingTimeMs: Math.round(averageProcessingTime),
      emailDeliveryRate: Math.round(emailDeliveryRate * 100) / 100,
    };
  }

  async getEventConversionMetrics(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: events } = await this.supabase
      .from('events')
      .select('event_type, status, urgency_level, ai_confidence, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (!events) return null;

    // Group by event type
    const eventTypeStats = events.reduce((acc, event) => {
      const type = event.event_type || 'unknown';
      if (!acc[type]) {
        acc[type] = {
          total: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
        };
      }
      
      acc[type].total++;
      if (event.status === 'confirmed') acc[type].confirmed++;
      if (event.status === 'completed') acc[type].completed++;
      if (event.status === 'cancelled') acc[type].cancelled++;
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate overall conversion rate
    const totalEvents = events.length;
    const convertedEvents = events.filter(e => 
      e.status === 'confirmed' || e.status === 'completed'
    ).length;
    
    const conversionRate = totalEvents > 0
      ? (convertedEvents / totalEvents) * 100
      : 0;

    // AI confidence analysis
    const highConfidenceEvents = events.filter(e => 
      (e.ai_confidence || 0) >= 0.8
    ).length;
    
    const averageConfidence = events.length > 0
      ? events.reduce((sum, e) => sum + (e.ai_confidence || 0), 0) / events.length
      : 0;

    return {
      totalEvents,
      convertedEvents,
      conversionRate: Math.round(conversionRate * 100) / 100,
      eventTypeStats,
      highConfidenceEvents,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
    };
  }

  async getCommunicationMetrics(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: communications } = await this.supabase
      .from('communication_logs')
      .select('communication_type, status, sent_at, delivered_at, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (!communications) return null;

    const emailStats = communications.filter(c => c.communication_type === 'email');
    const smsStats = communications.filter(c => c.communication_type === 'sms');

    const emailDeliveryRate = emailStats.length > 0
      ? (emailStats.filter(e => e.status === 'delivered').length / emailStats.length) * 100
      : 0;

    const smsDeliveryRate = smsStats.length > 0
      ? (smsStats.filter(s => s.status === 'delivered').length / smsStats.length) * 100
      : 0;

    return {
      totalCommunications: communications.length,
      emails: {
        sent: emailStats.length,
        delivered: emailStats.filter(e => e.status === 'delivered').length,
        deliveryRate: Math.round(emailDeliveryRate * 100) / 100,
      },
      sms: {
        sent: smsStats.length,
        delivered: smsStats.filter(s => s.status === 'delivered').length,
        deliveryRate: Math.round(smsDeliveryRate * 100) / 100,
      },
    };
  }
}