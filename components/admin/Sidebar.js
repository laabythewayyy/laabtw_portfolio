'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/login/actions';

const LINKS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/site', label: 'Site text' },
  { href: '/admin/skills', label: 'Skills' },
  { href: '/admin/resume', label: 'Resume' },
  { href: '/admin/build', label: 'What I build' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/contacts', label: 'Contacts' },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <nav className="adm-side" aria-label="Dashboard">
      <div className="adm-brand">
        TOLA <span>SANN</span>
      </div>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={path === l.href ? 'on' : undefined}>
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
