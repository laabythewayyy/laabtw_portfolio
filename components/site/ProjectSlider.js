'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { pageCount, pageIndex, perPage } from '@/lib/slider';

const GAP = 18;

function Card({ project, enterIndex }) {
  return (
    <article className={`proj${enterIndex !== null ? ' enter' : ''}`} style={enterIndex !== null ? { '--i': enterIndex } : undefined}>
      <div className="shot">
        {project.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- uploaded Supabase image
          <img src={project.image_url} alt="" loading="lazy" />
        ) : (
          <i className="fa-solid fa-bolt" aria-hidden="true"></i>
        )}
      </div>
      <div className="body">
        {project.category && <span className="cat">{project.category}</span>}
        <h3>{project.title}</h3>
        {project.description && <p>{project.description}</p>}
        {(project.live_url || project.code_url) && (
          <div className="links">
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener">
                Live site
              </a>
            )}
            {project.code_url && (
              <a href={project.code_url} target="_blank" rel="noopener">
                Code
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Filters + one-row slider (3 per page desktop, 2 tablet, 1 swipe on phones), ported from the demo.
 * Changing the filter: cards fade out (0.2s), swap, then rise in one after another (70ms stagger), back on page 1.
 */
export default function ProjectSlider({ projects, filters }) {
  const [active, setActive] = useState('All');
  const [shown, setShown] = useState('All'); // the filter whose cards are currently in the track
  const [fading, setFading] = useState(false);
  const [entering, setEntering] = useState(false);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const trackRef = useRef(null);
  const timer = useRef();

  const visible = shown === 'All' ? projects : projects.filter((p) => p.category === shown);

  const step = useCallback(() => {
    const t = trackRef.current;
    const card = t?.querySelector('.proj');
    return card ? card.getBoundingClientRect().width + GAP : t?.clientWidth || 1;
  }, []);
  // Jump to a page by scrolling to the exact left edge of that page's first card.
  // (Scrolling by a computed width can land a fraction of a pixel short, and scroll-snap then snaps back.)
  const goToPage = useCallback((target) => {
    const t = trackRef.current;
    const cards = t.querySelectorAll('.proj');
    if (!cards.length) return;
    const per = perPage(t.clientWidth, step(), GAP);
    const n = pageCount(cards.length, per);
    const p = Math.min(n - 1, Math.max(0, target));
    const first = cards[Math.min(p * per, cards.length - 1)];
    t.scrollTo({ left: first.offsetLeft - cards[0].offsetLeft });
  }, [step]);

  // Reads the slider's real position from the DOM (never from possibly-stale React state).
  const measure = useCallback(() => {
    const t = trackRef.current;
    const per = perPage(t.clientWidth, step(), GAP);
    const n = pageCount(t.querySelectorAll('.proj').length, per);
    const end = t.scrollLeft + t.clientWidth >= t.scrollWidth - 2;
    // at the far end the last page may be partly filled, so the scroll can't reach a full page width
    const current = end && t.scrollLeft > 2 ? n - 1 : pageIndex(t.scrollLeft, per * step(), n);
    return { n, current, start: t.scrollLeft <= 2, end };
  }, [step]);

  const update = useCallback(() => {
    const t = trackRef.current;
    if (!t || !t.clientWidth) return;
    const m = measure();
    setPages(m.n);
    setPage(m.current);
    setAtStart(m.start);
    setAtEnd(m.end);
  }, [measure]);

  useEffect(() => {
    const t = trackRef.current;
    t.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(t);
    return () => { t.removeEventListener('scroll', update); ro.disconnect(); };
  }, [update]);

  useEffect(() => { update(); }, [shown, update]);
  useEffect(() => () => clearTimeout(timer.current), []);

  function choose(name) {
    if (name === active) return;
    setActive(name);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEntering(false);
    setFading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setShown(name);
      setFading(false);
      setEntering(!reduce);
      trackRef.current?.scrollTo({ left: 0, behavior: 'instant' });
    }, reduce ? 0 : 200);
  }

  return (
    <>
      <div className="filters" role="group" aria-label="Filter projects">
        {filters.map((f) => (
          <button key={f} type="button" className={f === active ? 'on' : undefined} aria-pressed={f === active} onClick={() => choose(f)}>
            {f}
          </button>
        ))}
      </div>
      <div className="slider">
        <button className="arrow prev" type="button" aria-label="Previous projects" disabled={atStart}
          onClick={() => goToPage(measure().current - 1)}>
          <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </button>
        <div className={`proj-track${fading ? ' fading' : ''}`} ref={trackRef} aria-label="Projects">
          {visible.map((p, i) => (
            <Card key={`${shown}-${p.id}`} project={p} enterIndex={entering ? Math.min(i, 5) : null} />
          ))}
        </div>
        <button className="arrow next" type="button" aria-label="Next projects" disabled={atEnd}
          onClick={() => goToPage(measure().current + 1)}>
          <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>
      </div>
      <div className="dots" role="group" aria-label="Choose a page of projects" style={{ visibility: pages > 1 ? 'visible' : 'hidden' }}>
        {Array.from({ length: pages }, (_, i) => (
          <button key={i} type="button" aria-label={`Page ${i + 1}`} aria-current={i === page}
            className={i === page ? 'on' : undefined}
            onClick={() => goToPage(i)} />
        ))}
      </div>
    </>
  );
}
