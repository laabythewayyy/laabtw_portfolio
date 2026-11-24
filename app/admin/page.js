import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ADMIN_NAV, ADMIN_SECTIONS } from '@/lib/admin/schema';
import Loading from '@/components/admin/Loading';

const LISTS = ADMIN_NAV.filter((n) => n.section);

/** The cards with live counts (request time, so they stream in behind the loader). */
async function Stats() {
  const supabase = await createClient();
  const counts = await Promise.all(
    LISTS.map(async (n) => {
      const { count } = await supabase.from(ADMIN_SECTIONS[n.section].table).select('*', { count: 'exact', head: true });
      return count ?? 0;
    }),
  );
  return (
    <div className="adm-stats">
      <Link className="adm-stat" href="/admin/site">
        <b>✎</b>
        <span>Site text</span>
      </Link>
      {LISTS.map((n, i) => (
        <Link key={n.href} className="adm-stat" href={n.href}>
          <b>{counts[i]}</b>
          <span>{n.label}</span>
        </Link>
      ))}
    </div>
  );
}

/** Overview: one card per part of the site, with how many items each list has. */
export default function AdminHome() {
  return (
    <>
      <div className="head">
        <div>
          <h1>Dashboard</h1>
          <p className="sub">Everything on your website. Pick a part to edit.</p>
        </div>
        <a className="btn btn-line" href="/" target="_blank" rel="noopener">
          View site
        </a>
      </div>
      <Suspense fallback={<Loading />}>
        <Stats />
      </Suspense>
    </>
  );
}
