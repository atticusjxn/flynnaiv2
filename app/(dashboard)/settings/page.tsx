import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SettingsContent from '@/components/settings/SettingsContent';

export default async function SettingsPage() {
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

  return <SettingsContent user={user} profile={profile} />;
}