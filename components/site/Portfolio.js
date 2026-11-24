'use client';

import { useEffect } from 'react';
import { SECTION_IDS } from './sections';

/**
 * Section switching, ported from the demo's go():
 *  home -> section    : the intro rolls up into the top bar (0.4s), then the panel drops down
 *  section -> section : the old panel lifts away (0.25s), then the new one drops down
 *  section -> home    : the panel lifts away and the intro drops back to full height
 * Any element with data-s="<section>" switches sections. The URL hash follows the open section.
 * After each switch it dispatches window event "portfolio:section" { section, delayMs } for Lightning.
 */
export default function Portfolio({ children }) {
  useEffect(() => {
    let current = 'home';
    let switchTimer;
    let fillTimer;

    function go(s) {
      if (!SECTION_IDS.includes(s)) s = 'home';
      if (s === current && s !== 'home') return;
      const prev = document.getElementById('p-' + current);
      clearTimeout(switchTimer);
      clearTimeout(fillTimer);
      document.querySelectorAll('.panel').forEach((p) => p.classList.remove('leaving'));
      document.querySelectorAll('.menu a').forEach((a) => a.classList.toggle('active', a.dataset.s === s));
      const about = document.getElementById('p-about');
      about?.classList.remove('fill');
      const wasOpen = document.body.classList.contains('open');
      if (prev && wasOpen) {
        prev.classList.remove('show');
        prev.classList.add('leaving');
      }
      current = s;

      if (s === 'home') {
        switchTimer = setTimeout(() => {
          document.querySelectorAll('.panel').forEach((p) => p.classList.remove('show', 'leaving'));
          document.body.classList.remove('open');
          window.scrollTo(0, 0);
        }, prev && wasOpen ? 250 : 0);
        window.dispatchEvent(new CustomEvent('portfolio:section', { detail: { section: s, delayMs: 0 } }));
        return;
      }

      const delay = wasOpen ? 0.25 : 0.4; // wait for the old panel to lift / the bar to roll up
      const next = document.getElementById('p-' + s);
      next?.style.setProperty('--delay', delay + 's');
      document.body.classList.add('open');
      switchTimer = setTimeout(() => {
        prev?.classList.remove('leaving');
        window.scrollTo(0, 0);
      }, wasOpen ? 250 : 0);
      next?.classList.add('show');
      if (s === 'about') fillTimer = setTimeout(() => about?.classList.add('fill'), delay * 1000 + 250);
      window.dispatchEvent(new CustomEvent('portfolio:section', { detail: { section: s, delayMs: delay * 1000 } }));
    }

    function onClick(e) {
      const link = e.target.closest('[data-s]');
      if (!link) return;
      e.preventDefault();
      history.replaceState(null, '', '#' + link.dataset.s);
      go(link.dataset.s);
    }

    const onHash = () => go(location.hash.slice(1) || 'home');

    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', onHash);
    const start = location.hash.slice(1);
    if (start && start !== 'home') go(start);

    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', onHash);
      clearTimeout(switchTimer);
      clearTimeout(fillTimer);
      document.body.classList.remove('open');
    };
  }, []);

  return <main>{children}</main>;
}
