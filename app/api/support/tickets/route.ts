import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { Database } from '@/types/database.types';

const CreateTicketSchema = z.object({
  subject: z.string().min(1).max(255),
  description: z.string().min(10).max(5000),
  category: z.enum(['technical', 'billing', 'feature-request', 'bug-report', 'account', 'general']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  metadata: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && ['open', 'in_progress', 'waiting_for_user', 'resolved', 'closed'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: tickets, error } = await query;

    if (error) {
      console.error('Error fetching support tickets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tickets' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Support tickets API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateTicketSchema.parse(body);

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        ...validatedData,
        user_id: user.id,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating support ticket:', error);
      return NextResponse.json(
        { error: 'Failed to create ticket' },
        { status: 500 }
      );
    }

    // Create initial message
    await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticket.id,
        user_id: user.id,
        is_staff: false,
        message: validatedData.description,
      });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Support ticket creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}