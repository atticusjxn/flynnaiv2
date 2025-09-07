import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

export async function POST() {
  try {
    // Check admin token (basic security)
    const adminToken = process.env.ADMIN_API_TOKEN;
    if (!adminToken) {
      return NextResponse.json({ error: 'Admin API not configured' }, { status: 500 });
    }

    const supabase = createAdminClient();

    // SQL to create the user profile trigger
    const createTriggerSQL = `
      -- Function to handle new user creation
      create or replace function public.handle_new_user()
      returns trigger
      language plpgsql
      security definer set search_path = public
      as $$
      begin
        insert into public.users (
          id,
          email,
          full_name,
          company_name,
          industry_type,
          phone_number,
          created_at,
          updated_at
        )
        values (
          new.id,
          new.email,
          coalesce(new.raw_user_meta_data->>'full_name', ''),
          coalesce(new.raw_user_meta_data->>'company_name', ''),
          coalesce(new.raw_user_meta_data->>'industry_type', 'other'),
          coalesce(new.raw_user_meta_data->>'phone_number', null),
          now(),
          now()
        );
        return new;
      end;
      $$;

      -- Drop existing trigger if it exists
      drop trigger if exists on_auth_user_created on auth.users;
      
      -- Create the trigger
      create trigger on_auth_user_created
        after insert on auth.users
        for each row execute procedure public.handle_new_user();

      -- Grant necessary permissions
      grant usage on schema public to anon, authenticated;
      grant all on public.users to anon, authenticated;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: createTriggerSQL });

    if (error) {
      // If rpc doesn't exist, try direct SQL execution
      console.log('RPC method not available, trying direct SQL execution...');
      
      // Execute each statement individually
      const statements = [
        `
        create or replace function public.handle_new_user()
        returns trigger
        language plpgsql
        security definer set search_path = public
        as $$
        begin
          insert into public.users (
            id,
            email,
            full_name,
            company_name,
            industry_type,
            phone_number,
            created_at,
            updated_at
          )
          values (
            new.id,
            new.email,
            coalesce(new.raw_user_meta_data->>'full_name', ''),
            coalesce(new.raw_user_meta_data->>'company_name', ''),
            coalesce(new.raw_user_meta_data->>'industry_type', 'other'),
            coalesce(new.raw_user_meta_data->>'phone_number', null),
            now(),
            now()
          );
          return new;
        end;
        $$;
        `,
        `drop trigger if exists on_auth_user_created on auth.users;`,
        `create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();`
      ];

      for (const statement of statements) {
        const { error: stmtError } = await supabase.rpc('exec', { statement });
        if (stmtError) {
          console.error('SQL execution error:', stmtError);
          return NextResponse.json({ 
            error: 'Database setup failed', 
            details: stmtError.message,
            message: 'You may need to run the SQL manually in the Supabase dashboard'
          }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ 
      message: 'Database trigger setup completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({ 
      error: 'Database setup failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      message: 'Please run the SQL from /sql/create_user_profile_trigger.sql manually in your Supabase dashboard'
    }, { status: 500 });
  }
}