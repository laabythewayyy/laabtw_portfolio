import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const TABLES = [
  { table: 'skills', label: 'Skills', href: '/admin/skills' },
  { table: 'resume_entries', label: 'Resume entries', href: '/admin/resume' },
  { table: 'build_items', label: 'What I build', href: '/admin/build' },
  { table: 'projects', label: 'Projects', href: '/admin/projects' },
  { table: 'contacts', label: 'Contacts', href: '/admin/contacts' },
];

export default async function AdminHome() {
  const supabase = await createClient();
  const counts = await Promise.all(
    TABLES.map(async (t) => {
      const { count } = await supabase.from(t.table).select('*', { count: 'exact', head: true });
      return count ?? 0;
    }),
  );
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Dashboard</h1>
          <p className="adm-sub">Everything on your website. Pick a part to edit.</p>
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
        {TABLES.map((t, i) => (
          <Link key={t.table} className="adm-stat" href={t.href}>
            <b>{counts[i]}</b>
            <span>{t.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
