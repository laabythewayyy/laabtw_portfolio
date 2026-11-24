'use client';

import { useEffect, useRef } from 'react';
import { boltPath, strokeBolt } from '@/lib/lightning/bolt';

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
      strokeBolt(ctx, pts, k, 3);
      raf = requestAnimationFrame(draw);
    };
    const start = setTimeout(() => { raf = requestAnimationFrame(draw); }, 300);
    return () => { clearTimeout(start); cancelAnimationFrame(raf); };
  }, [targetId]);

  return <canvas ref={ref} className="login-strike" aria-hidden="true" />;
}
