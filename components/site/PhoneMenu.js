'use client';

import { useEffect, useState } from 'react';
import { SECTIONS } from './sections';

/** Phones (≤820px): three-line button and a full-screen menu that slides in from the right.
 *  The links carry data-s, so Portfolio switches the section; this only opens/closes the menu. */
export default function PhoneMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        id="menu-btn"
        className={`menu-btn${open ? ' active' : ''}`}
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
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
      <div id="mobile-menu" className={open ? 'open' : undefined}>
        <ul>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} data-s={s.id} className="mobile-link" onClick={() => setOpen(false)}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
