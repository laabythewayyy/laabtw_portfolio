'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/login/actions';
import { ADMIN_NAV } from '@/lib/admin/schema';
import HamburgerMenu from '@/components/HamburgerMenu';

/** Dashboard navigation: a sidebar on wider screens, the hamburger menu (same as the public site) on phones. */
export default function Sidebar() {
  const path = usePathname();
  const current = (href) => (path === href ? 'page' : undefined);

  return (
    <>
      <nav className="adm-side" aria-label="Dashboard">
        <div className="adm-brand">
          TOLA <span>SANN</span>
        </div>
        {ADMIN_NAV.map((l) => (
          <Link key={l.href} href={l.href} className={current(l.href) && 'on'} aria-current={current(l.href)}>
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

      <HamburgerMenu compact label="dashboard menu">
        {ADMIN_NAV.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={`mobile-link${current(l.href) ? ' on' : ''}`} aria-current={current(l.href)}>
              {l.label}
            </Link>
          </li>
        ))}
        <li className="menu-sep" aria-hidden="true" />
        <li>
          <a href="/" target="_blank" rel="noopener" className="mobile-link">
            View site
          </a>
        </li>
        <li>
          <form action={signOut}>
            <button type="submit" className="mobile-link">
              Sign out
            </button>
          </form>
        </li>
      </HamburgerMenu>
    </>
  );
}
