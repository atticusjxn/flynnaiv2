import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { Database } from '@/types/database.types';

const CreateMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
});

export async function POST(
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

    // Verify user owns the ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = CreateMessageSchema.parse(body);

    const { data: message, error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: params.id,
        user_id: user.id,
        is_staff: false,
        message: validatedData.message,
        attachments: validatedData.attachments,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating support message:', error);
      return NextResponse.json(
        { error: 'Failed to create message' },
        { status: 500 }
      );
    }

    // Update ticket status to waiting for response if it was resolved
    await supabase
      .from('support_tickets')
      .update({ 
        status: 'waiting_for_user',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('status', 'resolved');

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Support message creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}