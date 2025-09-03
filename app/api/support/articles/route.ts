import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { Database } from '@/types/database.types';

const SearchSchema = z.object({
  query: z.string().optional(),
  category: z.enum(['getting-started', 'setup', 'troubleshooting', 'billing', 'api', 'industry-specific', 'features']).optional(),
  industry_type: z.enum(['plumbing', 'real_estate', 'legal', 'medical', 'sales', 'consulting', 'general_services', 'all']).optional(),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    
    // Convert string numbers to actual numbers
    if (searchParams.limit) searchParams.limit = parseInt(searchParams.limit);
    if (searchParams.offset) searchParams.offset = parseInt(searchParams.offset);
    
    const validatedParams = SearchSchema.parse(searchParams);
    
    let query = supabase
      .from('support_articles')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(validatedParams.offset, validatedParams.offset + validatedParams.limit - 1);

    // Apply filters
    if (validatedParams.query) {
      query = query.or(`title.ilike.%${validatedParams.query}%,content.ilike.%${validatedParams.query}%,search_keywords.ilike.%${validatedParams.query}%`);
    }
    
    if (validatedParams.category) {
      query = query.eq('category', validatedParams.category);
    }
    
    if (validatedParams.industry_type) {
      query = query.or(`industry_type.eq.${validatedParams.industry_type},industry_type.eq.all`);
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error('Error fetching support articles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch articles' },
        { status: 500 }
      );
    }

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Support articles API error:', error);
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
    
    const CreateArticleSchema = z.object({
      title: z.string().min(1).max(255),
      content: z.string().min(1),
      category: z.enum(['getting-started', 'setup', 'troubleshooting', 'billing', 'api', 'industry-specific', 'features']),
      industry_type: z.enum(['plumbing', 'real_estate', 'legal', 'medical', 'sales', 'consulting', 'general_services', 'all']).optional(),
      tags: z.array(z.string()).optional(),
      search_keywords: z.string().optional(),
    });
    
    const validatedData = CreateArticleSchema.parse(body);
    
    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    const { data: article, error } = await supabase
      .from('support_articles')
      .insert({
        ...validatedData,
        slug,
        author_id: user.id,
        is_published: true,
        view_count: 0,
        helpful_count: 0,
        not_helpful_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating support article:', error);
      return NextResponse.json(
        { error: 'Failed to create article' },
        { status: 500 }
      );
    }

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Support article creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}