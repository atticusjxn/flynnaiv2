// Flynn.ai v2 - Event Database Operations
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type EventUpdate = Database['public']['Tables']['events']['Update'];

export class EventService {
  private supabase = createClient();

  async createEvent(eventData: EventInsert): Promise<Event | null> {
    const { data, error } = await this.supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return null;
    }

    return data;
  }

  async createMultipleEvents(eventsData: EventInsert[]): Promise<Event[]> {
    const { data, error } = await this.supabase
      .from('events')
      .insert(eventsData)
      .select();

    if (error) {
      console.error('Error creating multiple events:', error);
      return [];
    }

    return data || [];
  }

  async updateEvent(
    eventId: string,
    updates: EventUpdate
  ): Promise<Event | null> {
    const { data, error } = await this.supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return null;
    }

    return data;
  }

  async getEventById(eventId: string): Promise<Event | null> {
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return null;
    }

    return data;
  }

  async getEventsByCallId(callId: string): Promise<Event[]> {
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .eq('call_id', callId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events by call ID:', error);
      return [];
    }

    return data || [];
  }

  async getUserEvents(
    userId: string,
    limit = 50,
    offset = 0,
    status?: Event['status']
  ): Promise<Event[]> {
    let query = this.supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user events:', error);
      return [];
    }

    return data || [];
  }

  async getPendingEvents(userId: string): Promise<Event[]> {
    return this.getUserEvents(userId, 100, 0, 'pending');
  }

  async updateEventStatus(
    eventId: string,
    status: Event['status'],
    completedAt?: string
  ): Promise<void> {
    const updates: EventUpdate = { status };
    if (status === 'completed' && completedAt) {
      updates.completed_at = completedAt;
    }

    await this.supabase.from('events').update(updates).eq('id', eventId);
  }

  async markCalendarSynced(
    eventId: string,
    calendarEventId: string
  ): Promise<void> {
    await this.supabase
      .from('events')
      .update({
        calendar_synced: true,
        calendar_event_id: calendarEventId,
      })
      .eq('id', eventId);
  }

  async markConfirmationSent(eventId: string): Promise<void> {
    await this.supabase
      .from('events')
      .update({ confirmation_sent_at: new Date().toISOString() })
      .eq('id', eventId);
  }

  async getEventStats(userId: string) {
    const { data, error } = await this.supabase.rpc('get_user_event_stats', {
      user_uuid: userId,
    });

    if (error) {
      console.error('Error fetching event stats:', error);
      return null;
    }

    return (
      data?.[0] || {
        total_events: 0,
        pending_events: 0,
        confirmed_events: 0,
        completed_events: 0,
        conversion_rate: 0,
      }
    );
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      return false;
    }

    return true;
  }
}
