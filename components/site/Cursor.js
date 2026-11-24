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
    let tx = -100, ty = -100, cx = -100, cy = -100, raf;

    const move = (e) => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); };
    const leave = () => cur.classList.remove('on');
    const down = () => cur.classList.add('down');
    const up = () => cur.classList.remove('down');
    const follow = () => {
      cx += (tx - cx) * (still ? 1 : 0.35);
      cy += (ty - cy) * (still ? 1 : 0.35);
      cur.style.left = cx + 'px';
      cur.style.top = cy + 'px';
      raf = requestAnimationFrame(follow);
    };

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    raf = requestAnimationFrame(follow);
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
