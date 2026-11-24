import { Suspense } from 'react';
import { connection } from 'next/server';
import { requireAdmin } from '@/lib/supabase/server';
import Sidebar from '@/components/admin/Sidebar';
import './admin.css';

export const metadata = { title: 'Dashboard · Tola Sann', robots: { index: false } };

/** Checks the admin on every request (reads the session cookie, so it can't be prerendered). */
async function Guard({ children }) {
  await connection(); // render at request time: the session check reads cookies and the clock
  await requireAdmin();
  return children;
}

export default function AdminLayout({ children }) {
  return (
    <div className="adm">
      {/* the sidebar highlights the current page (reads the URL), so it streams in */}
      <Suspense fallback={<nav className="adm-side" aria-label="Dashboard" />}>
        <Sidebar />
      </Suspense>
      <main className="adm-main">
        <Suspense fallback={<p className="hint">Loading…</p>}>
          <Guard>{children}</Guard>
        </Suspense>
      </main>
    </div>
  );
}
