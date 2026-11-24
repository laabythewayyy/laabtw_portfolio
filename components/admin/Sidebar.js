'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/login/actions';
import { ADMIN_NAV } from '@/lib/admin/schema';

export default function Sidebar() {
  const path = usePathname();
  return (
    <nav className="adm-side" aria-label="Dashboard">
      <div className="adm-brand">
        TOLA <span>SANN</span>
      </div>
      {ADMIN_NAV.map((l) => (
        <Link key={l.href} href={l.href} className={path === l.href ? 'on' : undefined} aria-current={path === l.href ? 'page' : undefined}>
          {l.label}
        </Link>
      ))}
      <div className="sep" />
      <a href="/" target="_blank" rel="noopener">
        View site
      </a>
      <form action={signOut}>
        <button type="submit">Sign out</button>
      </form>
    </nav>
  );
}
