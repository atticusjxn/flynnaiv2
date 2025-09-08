import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OnboardingContent from '@/components/onboarding/OnboardingContent';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  return <OnboardingContent userId={user.id} />;
}