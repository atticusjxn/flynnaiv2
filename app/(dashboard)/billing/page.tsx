import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BillingContent from '@/components/billing/BillingContent';

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  return <BillingContent userId={user.id} />;
}