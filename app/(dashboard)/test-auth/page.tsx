import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TestAuthContent from '@/components/auth/TestAuthContent';

export default async function TestAuthPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return <TestAuthContent user={user} profile={profile} />;
}