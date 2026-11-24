'use client';

import { useEffect, useRef } from 'react';

/** Mouse users only: a solid white dot that follows the mouse with slight easing.
 *  It does not change on hover; it only shrinks briefly while the mouse button is down. */
export default function Cursor() {
  const ref = useRef(null);

  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const cur = ref.current;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('custom-cursor');
    let tx = -100, ty = -100, cx = -100, cy = -100, raf = 0;

    // eases towards the mouse, and stops animating once it has caught up (no work while the mouse is still)
    const follow = () => {
      cx += (tx - cx) * (still ? 1 : 0.35);
      cy += (ty - cy) * (still ? 1 : 0.35);
      if (Math.abs(tx - cx) < 0.1 && Math.abs(ty - cy) < 0.1) { cx = tx; cy = ty; }
      cur.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`; // GPU move, no layout
      raf = cx === tx && cy === ty ? 0 : requestAnimationFrame(follow);
    };
    const move = (e) => {
      tx = e.clientX; ty = e.clientY;
      cur.classList.add('on');
      if (!raf) raf = requestAnimationFrame(follow);
    };
    const leave = () => cur.classList.remove('on');
    const down = () => cur.classList.add('down');
    const up = () => cur.classList.remove('down');

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', leave);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      document.documentElement.classList.remove('custom-cursor');
    };
  }, []);

  return <div ref={ref} className="cursor" aria-hidden="true"></div>;
}
