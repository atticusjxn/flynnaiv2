'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error('Login error:', error);
    redirect('/login?message=' + encodeURIComponent(error.message));
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  // Validate inputs
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const companyName = formData.get('companyName') as string;
  const industryType = formData.get('industryType') as string;
  const phoneNumber = formData.get('phoneNumber') as string || null;

  if (!email || !password || !fullName || !companyName || !industryType) {
    redirect('/register?message=' + encodeURIComponent('Please fill in all required fields'));
  }

  if (password.length < 6) {
    redirect('/register?message=' + encodeURIComponent('Password must be at least 6 characters long'));
  }

  console.log('Attempting signup for:', email);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company_name: companyName,
        industry_type: industryType,
        phone_number: phoneNumber,
      }
    }
  });

  if (error) {
    console.error('Signup error:', error);
    redirect('/register?message=' + encodeURIComponent(error.message));
  }

  console.log('Signup successful:', data.user?.email);
  revalidatePath('/', 'layout');
  redirect('/register?message=' + encodeURIComponent('Check email to continue sign in process'));
}

export async function signout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}