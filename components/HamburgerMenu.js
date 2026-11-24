'use client';

import { useEffect, useState } from 'react';

/**
 * Phones (≤820px): the three-line button and a full-screen menu that slides in from the right.
 * Used by the public site and the dashboard. `children` are the <li> items; clicking any link
 * or button inside closes the menu. Escape closes it too. `compact` = smaller links, for longer menus.
 */
export default function HamburgerMenu({ children, compact = false, label = 'menu' }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        className={`menu-btn${open ? ' active' : ''}`}
        type="button"
        aria-label={open ? `Close ${label}` : `Open ${label}`}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="lines" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
      <div id="menu-bg" className={open ? 'open' : undefined} aria-hidden="true"></div>
      <div
        id="mobile-menu"
        className={`${open ? 'open' : ''}${compact ? ' compact' : ''}`.trim() || undefined}
        onClick={(e) => e.target.closest('a, button') && setOpen(false)}
      >
        <ul>{children}</ul>
      </div>
    </>
  );
}
