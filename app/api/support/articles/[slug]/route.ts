import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createClient();

    const { data: article, error } = await supabase
      .from('support_articles')
      .select('*')
      .eq('slug', params.slug)
      .eq('is_published', true)
      .single();

    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Increment view count
    await supabase
      .from('support_articles')
      .update({ view_count: (article.view_count || 0) + 1 })
      .eq('id', article.id);

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Support article fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { helpful } = body;

    if (typeof helpful !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid feedback. Must specify helpful as boolean.' },
        { status: 400 }
      );
    }

    // Get current article
    const { data: article, error: fetchError } = await supabase
      .from('support_articles')
      .select('helpful_count, not_helpful_count')
      .eq('slug', params.slug)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Update feedback count
    const updateData = helpful
      ? { helpful_count: (article.helpful_count || 0) + 1 }
      : { not_helpful_count: (article.not_helpful_count || 0) + 1 };

    const { error: updateError } = await supabase
      .from('support_articles')
      .update(updateData)
      .eq('slug', params.slug);

    if (updateError) {
      console.error('Error updating article feedback:', updateError);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Support article feedback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
