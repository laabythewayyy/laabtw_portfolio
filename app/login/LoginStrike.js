'use client';

import { useEffect, useRef } from 'react';
import { boltPath } from '@/lib/lightning/bolt';

/** One lightning strike onto the title when the login page loads (none under reduced motion). */
export default function LoginStrike({ targetId }) {
  const ref = useRef(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = ref.current, target = document.getElementById(targetId);
    if (!c || !target) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const r = target.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const pts = boltPath(x + (Math.random() - 0.5) * 240, -10, x, r.top - 6, 0.2);
    const born = performance.now(), life = 450;
    let raf;
    const draw = (now) => {
      const k = 1 - (now - born) / life;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      if (k <= 0) return;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = '#ffb300';
      for (const [w, col, blur] of [[9, `rgba(255,170,0,${k * 0.35})`, 28], [3, `rgba(255,248,220,${k})`, 12]]) {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (const p of pts) ctx.lineTo(p[0], p[1]);
        ctx.lineWidth = w; ctx.strokeStyle = col; ctx.shadowBlur = blur; ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    const start = setTimeout(() => { raf = requestAnimationFrame(draw); }, 300);
    return () => { clearTimeout(start); cancelAnimationFrame(raf); };
  }, [targetId]);

  return <canvas ref={ref} className="login-strike" aria-hidden="true" />;
}
