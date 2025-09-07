-- Flynn.ai v2 - Create user profile automatically on signup
-- This trigger function creates a user profile record when a new auth user is created

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

-- Trigger that calls the function when a new user is created in auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.users to anon, authenticated;