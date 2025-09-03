import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { Database } from '@/types/database.types';

const UpdateTicketSchema = z.object({
  status: z.enum(['open', 'in_progress', 'waiting_for_user', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch ticket with messages
    const [ticketResult, messagesResult] = await Promise.all([
      supabase
        .from('support_tickets')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', params.id)
        .order('created_at', { ascending: true })
    ]);

    if (ticketResult.error || !ticketResult.data) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (messagesResult.error) {
      console.error('Error fetching messages:', messagesResult.error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ticket: ticketResult.data,
      messages: messagesResult.data || []
    });
  } catch (error) {
    console.error('Support ticket fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = UpdateTicketSchema.parse(body);

    const updateData: any = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    // Set resolved timestamp if status is resolved
    if (validatedData.status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    // Set closed timestamp if status is closed
    if (validatedData.status === 'closed') {
      updateData.closed_at = new Date().toISOString();
    }

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating support ticket:', error);
      return NextResponse.json(
        { error: 'Failed to update ticket' },
        { status: 500 }
      );
    }

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Support ticket update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}