import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

/** Supabase client that reads/writes the login session cookie (request time only). */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component: cookies are read-only there. The proxy refreshes the session.
        }
      },
    },
  });
}

/** The signed-in user, but only if it is the site owner (ADMIN_USER_ID). Otherwise null. */
export async function getAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  return user && user.id === process.env.ADMIN_USER_ID ? user : null;
}

/** Use at the top of every admin page and action. Sends anyone else to /login. */
export async function requireAdmin() {
  const user = await getAdmin();
  if (!user) redirect('/login');
  return user;
}
