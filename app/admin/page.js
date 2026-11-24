import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ADMIN_NAV, ADMIN_SECTIONS } from '@/lib/admin/schema';

/** Overview: one card per part of the site, with how many items each list has. */
export default async function AdminHome() {
  const supabase = await createClient();
  const lists = ADMIN_NAV.filter((n) => n.section);
  const counts = await Promise.all(
    lists.map(async (n) => {
      const { count } = await supabase.from(ADMIN_SECTIONS[n.section].table).select('*', { count: 'exact', head: true });
      return count ?? 0;
    }),
  );
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
      <div className="adm-stats">
        <Link className="adm-stat" href="/admin/site">
          <b>✎</b>
          <span>Site text</span>
        </Link>
        {lists.map((n, i) => (
          <Link key={n.href} className="adm-stat" href={n.href}>
            <b>{counts[i]}</b>
            <span>{n.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
