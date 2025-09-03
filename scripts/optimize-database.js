#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Database optimization script - creates indexes and optimizes queries
 */
async function optimizeDatabase() {
  console.log('🚀 Starting database optimization...\n');

  try {
    // Create optimized indexes
    const indexes = [
      // Calls table indexes for performance
      {
        name: 'idx_calls_user_created',
        sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_user_created ON calls(user_id, created_at DESC);',
        description: 'Optimize calls listing by user and date',
      },
      {
        name: 'idx_calls_status_filter',
        sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_status_filter ON calls(call_status) WHERE call_status IS NOT NULL;',
        description: 'Optimize status filtering',
      },
      {
        name: 'idx_calls_urgency_filter',
        sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_urgency_filter ON calls(urgency_level) WHERE urgency_level IS NOT NULL;',
        description: 'Optimize urgency filtering',
      },
      {
        name: 'idx_calls_ai_status',
        sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_ai_status ON calls(ai_processing_status) WHERE ai_processing_status IS NOT NULL;',
        description: 'Optimize AI status filtering',
      },

      // Events table indexes
      {
        name: 'idx_events_call_id',
        sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_call_id ON events(call_id);',
        description: 'Optimize event-call relationships',
      },
      {
        name: 'idx_events_user_date',
        sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_user_date ON events(user_id, event_date DESC) WHERE event_date IS NOT NULL;',
        description: 'Optimize event listing by user and date',
      },

      // Communications table indexes
      {
        name: 'idx_communications_event',
        sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_communications_event ON communications(event_id);',
        description: 'Optimize communication-event relationships',
      },
      {
        name: 'idx_communications_status',
        sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_communications_status ON communications(status) WHERE status IS NOT NULL;',
        description: 'Optimize communication status queries',
      },
    ];

    // Create indexes
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const index of indexes) {
      try {
        console.log(`Creating index: ${index.name}`);
        console.log(`  Description: ${index.description}`);

        const { error } = await supabase.rpc('exec', {
          sql: index.sql,
        });

        if (error) {
          if (error.message.includes('already exists')) {
            console.log(`  ⏭️  Index already exists, skipping\n`);
            skipCount++;
          } else {
            throw error;
          }
        } else {
          console.log(`  ✅ Successfully created\n`);
          successCount++;
        }
      } catch (error) {
        console.error(
          `  ❌ Failed to create index ${index.name}:`,
          error.message
        );
        console.log('  📝 SQL:', index.sql);
        console.log('');
        errorCount++;
      }
    }

    // Create database functions for analytics
    console.log('📊 Creating analytics functions...\n');

    const analyticsFunction = `
      CREATE OR REPLACE FUNCTION get_user_analytics(
        p_user_id UUID,
        p_start_date TIMESTAMPTZ,
        p_end_date TIMESTAMPTZ
      )
      RETURNS TABLE (
        total_calls INTEGER,
        avg_processing_time_seconds NUMERIC,
        success_rate NUMERIC
      )
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          COUNT(*)::INTEGER as total_calls,
          AVG(EXTRACT(EPOCH FROM (processed_at - created_at)))::NUMERIC as avg_processing_time_seconds,
          (COUNT(*) FILTER (WHERE ai_processing_status = 'completed')::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0) * 100) as success_rate
        FROM calls 
        WHERE user_id = p_user_id 
          AND created_at >= p_start_date 
          AND created_at <= p_end_date;
      END;
      $$;
    `;

    try {
      const { error } = await supabase.rpc('exec', { sql: analyticsFunction });
      if (error) throw error;
      console.log('✅ Analytics function created successfully\n');
    } catch (error) {
      console.error('❌ Failed to create analytics function:', error.message);
    }

    // Check table statistics
    console.log('📈 Gathering table statistics...\n');

    const tables = [
      'calls',
      'events',
      'communications',
      'users',
      'phone_numbers',
    ];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        console.log(`  ${table}: ${count || 0} rows`);
      } catch (error) {
        console.log(`  ${table}: Unable to count (${error.message})`);
      }
    }

    // Summary
    console.log('\n🎉 Database optimization complete!');
    console.log(`✅ Indexes created: ${successCount}`);
    console.log(`⏭️  Indexes skipped: ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    if (errorCount > 0) {
      console.log('\n⚠️  Some optimizations failed. Check the errors above.');
      console.log(
        "This is normal if you don't have sufficient database permissions."
      );
    }
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    process.exit(1);
  }
}

// Run optimization
optimizeDatabase().catch(console.error);
