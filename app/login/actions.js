'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const WRONG = 'Email or password is incorrect.';

/** Signs in with email + password. Only the site owner (ADMIN_USER_ID) may stay signed in. */
export async function signIn(_prevState, formData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  if (!email || !password) return { error: WRONG, email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data?.user) return { error: WRONG, email };
  if (data.user.id !== process.env.ADMIN_USER_ID) {
    await supabase.auth.signOut();
    return { error: WRONG, email };
  }
  redirect('/admin');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
