import { boltPath } from './bolt';

/**
 * All lightning effects, ported from mockups/demo-v7.html. Browser only.
 * Needs these elements: #zap (inside .hero-art, next to .portrait), #glow, #sky, #flash, #fx.
 * Listens to window "portfolio:section" { section, delayMs } for the panel strike.
 * Returns stop(), which removes every listener, timer, observer and animation loop.
 */
export function startLightning() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(devicePixelRatio || 1, 2);
  const rnd = (a, b) => a + Math.random() * (b - a);

  const timers = new Set();
  const later = (fn, ms) => {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  };
  const listeners = [];
  const on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    listeners.push(() => target.removeEventListener(type, fn, opts));
  };
  let stopped = false;
  const rafs = new Set();
  const loop = (fn) => {
    const tick = (now) => { if (stopped) return; fn(now); rafs.add(requestAnimationFrame(tick)); };
    rafs.add(requestAnimationFrame(tick));
  };

  // draw a bolt with a gold glow and white core, plus a few branches
  function drawBolt(ctx, pts, alpha, width, branches = true) {
    const line = (p, w, col, blur) => {
      ctx.beginPath();
      ctx.moveTo(p[0][0], p[0][1]);
      for (const q of p) ctx.lineTo(q[0], q[1]);
      ctx.lineWidth = w; ctx.strokeStyle = col; ctx.shadowBlur = blur; ctx.shadowColor = '#ffb300';
      ctx.stroke();
    };
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    line(pts, width * 3, `rgba(255,170,0,${alpha * 0.35})`, 28);
    line(pts, width, `rgba(255,248,220,${alpha})`, 12);
    if (branches) {
      for (let k = 0; k < 2; k++) {
        if (Math.random() < 0.6) continue;
        const s = pts[Math.floor(rnd(0.2, 0.7) * pts.length)];
        const e = pts[pts.length - 1];
        const ang = Math.atan2(e[1] - s[1], e[0] - s[0]) + rnd(-0.9, 0.9);
        const L = Math.hypot(e[0] - s[0], e[1] - s[1]) * rnd(0.3, 0.6);
        drawBolt(ctx, boltPath(s[0], s[1], s[0] + Math.cos(ang) * L, s[1] + Math.sin(ang) * L, 0.18), alpha * 0.7, width * 0.6, false);
      }
    }
    ctx.shadowBlur = 0;
  }
  function fit(c) {
    const r = c.getBoundingClientRect();
    c.width = r.width * DPR;
    c.height = r.height * DPR;
    const ctx = c.getContext('2d');
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return ctx;
  }

  /* --- 1. electric ring + strikes around the avatar circle --- */
  const zap = document.getElementById('zap');
  const art = document.querySelector('.hero-art');
  const portrait = document.querySelector('.portrait');
  let zctx = fit(zap);
  // Re-measure whenever the canvas changes size, e.g. it was hidden (0x0) because the page opened on a section.
  const zapObserver = new ResizeObserver(() => { zctx = fit(zap); });
  zapObserver.observe(zap);
  let strikes = [];
  function circle() {
    const a = art.getBoundingClientRect(), p = portrait.getBoundingClientRect();
    const R = p.width / 2, cx = p.left - a.left + R, cy = p.bottom - a.top - R;
    const at = (u) => {
      const t = -Math.PI / 2 + (u * Math.PI) / 3, nx = Math.cos(t), ny = Math.sin(t);
      return { x: cx + nx * R, y: cy + ny * R, nx, ny };
    };
    return { cx, cy, R, top: [cx, cy - R], at };
  }
  function strikeFromRing() {
    const h = circle(), p = h.at(rnd(0, 6)), L = h.R * rnd(0.35, 0.8), turn = rnd(-0.4, 0.4);
    const ex = p.nx * Math.cos(turn) - p.ny * Math.sin(turn), ey = p.nx * Math.sin(turn) + p.ny * Math.cos(turn);
    const sx = p.x + p.nx * 14, sy = p.y + p.ny * 14;
    strikes.push({ pts: boltPath(sx, sy, sx + ex * L, sy + ey * L, 0.22), born: performance.now(), life: rnd(180, 320), w: rnd(1.6, 2.6) });
  }
  function bigStrike() {
    const h = circle();
    strikes.push({ pts: boltPath(h.top[0] + rnd(-h.R, h.R), -10, h.top[0], h.top[1] - 10, 0.2), born: performance.now(), life: 420, w: 3.2 });
    flash();
  }
  let ringPts = [], lastJitter = 0;
  function ringArcs() {
    const h = circle(), arcs = [];
    const n = Math.floor(rnd(2, 5));
    for (let i = 0; i < n; i++) {
      const start = rnd(0, 6), span = rnd(0.3, 0.9), steps = 14, pts = [];
      for (let s = 0; s <= steps; s++) {
        const p = h.at(start + (span * s) / steps), off = 16 + rnd(-6, 6);
        pts.push([p.x + p.nx * off, p.y + p.ny * off]);
      }
      arcs.push({ pts, a: rnd(0.55, 1) });
    }
    return arcs;
  }
  function drawZap(now) {
    if (document.body.classList.contains('open')) return;
    zctx.clearRect(0, 0, zap.width, zap.height);
    // mask: never draw inside the circle, so bolts don't cross the avatar
    const h = circle();
    zctx.save();
    zctx.beginPath();
    zctx.rect(0, 0, zap.width, zap.height);
    zctx.arc(h.cx, h.cy, h.R - 2, 0, Math.PI * 2);
    zctx.clip('evenodd');
    if (now - lastJitter > 60) { ringPts = ringArcs(); lastJitter = now; }
    for (const a of ringPts) drawBolt(zctx, a.pts, a.a, 1.7, false);
    strikes = strikes.filter((s) => now - s.born < s.life);
    for (const s of strikes) {
      const k = 1 - (now - s.born) / s.life;
      drawBolt(zctx, s.pts, k * (Math.random() < 0.2 ? 0.4 : 1), s.w);
    }
    zctx.restore();
  }
  function scheduleRing() {
    strikeFromRing();
    if (Math.random() < 0.4) later(strikeFromRing, 90);
    later(scheduleRing, rnd(700, 2000));
  }

  /* --- 2. whole-page effects: sky = behind the content, fx = above it --- */
  const sky = document.getElementById('sky'), fx = document.getElementById('fx');
  let sctx = fit(sky), fctx = fit(fx);
  const layers = { sky: [], fx: [] };
  const crackles = [];
  const flashEl = document.getElementById('flash'), glow = document.getElementById('glow');

  function flash(x = innerWidth / 2, y = innerHeight / 3, strong = 1) {
    flashEl.style.setProperty('--s', strong);
    flashEl.classList.remove('on'); void flashEl.offsetWidth; flashEl.classList.add('on');
    glow.style.setProperty('--x', x + 'px');
    glow.style.setProperty('--y', y + 'px');
    glow.classList.remove('on'); void glow.offsetWidth; glow.classList.add('on');
  }
  const add = (layer, pts, life, w, a = 1, branches = true) => layers[layer].push({ pts, born: performance.now(), life, w, a, branches });
  function sparks(x, y, n = 7, len = 46) {
    for (let i = 0; i < n; i++) {
      const ang = (Math.PI * 2 * i) / n + rnd(-0.3, 0.3), L = rnd(len * 0.5, len);
      add('fx', boltPath(x, y, x + Math.cos(ang) * L, y + Math.sin(ang) * L, 0.25), rnd(160, 280), 1.4, 0.9, false);
    }
  }
  // text that the background storm likes to strike behind
  function textTarget() {
    const sel = document.body.classList.contains('menu-open')
      ? '#mobile-menu .mobile-link'
      : '.intro h1, .intro .lead, .panel.show h2, .panel.show h3, .panel.show .sec-label, .panel.show h4';
    const els = [...document.querySelectorAll(sel)]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width && r.bottom > 40 && r.top < innerHeight - 20);
    if (!els.length) return null;
    const r = els[Math.floor(Math.random() * els.length)];
    return [rnd(r.left, r.right), rnd(r.top, r.bottom)];
  }
  function skySparks(x, y) {
    for (let i = 0; i < 6; i++) {
      const ang = rnd(0, Math.PI * 2), L = rnd(30, 80);
      add('sky', boltPath(x, y, x + Math.cos(ang) * L, y + Math.sin(ang) * L, 0.25), rnd(220, 380), 1.3, 0.6, false);
    }
  }
  function skyStrike() {
    const w = innerWidth, h = innerHeight, t = Math.random() < 0.6 ? textTarget() : null;
    const ex = t ? t[0] : rnd(w * 0.05, w * 0.95), ey = t ? t[1] : h * rnd(0.5, 0.95), x = ex + rnd(-w * 0.12, w * 0.12);
    add('sky', boltPath(x, -20, ex, ey, 0.16), 600, 2.4, t ? 0.75 : 0.55);
    if (t) skySparks(ex, ey);
    flash(ex, ey, 0.7);
    if (Math.random() < 0.45) {
      later(() => {
        const x2 = x + rnd(-120, 120);
        add('sky', boltPath(x2, -20, x2 + rnd(-150, 150), h * rnd(0.3, 0.6), 0.18), 450, 1.6, 0.4);
      }, rnd(90, 220));
    }
    later(skyStrike, rnd(2000, 4500));
  }

  // mouse / finger trail
  const trail = [];
  let pointer = { x: innerWidth / 2, y: innerHeight / 2, on: false };
  const track = (x, y, now) => {
    const last = trail[trail.length - 1];
    pointer = { x, y, on: true };
    if (!last || Math.hypot(x - last.x, y - last.y) > 6) trail.push({ x, y, t: now });
    return last;
  };
  let touchOff;
  function drawTrail(now) {
    while (trail.length && now - trail[0].t > 260) trail.shift();
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1], b = trail[i], age = (now - b.t) / 260;
      drawBolt(fctx, boltPath(a.x, a.y, b.x, b.y, 0.3), (1 - age) * 0.95, 1.1 + (1 - age) * 1.2, false);
    }
  }

  // opening a section: a bolt strikes the panel's top edge, which crackles briefly
  function panelStrike(section, delayMs) {
    if (section === 'home') return;
    later(() => {
      const p = document.getElementById('p-' + section);
      if (!p) return;
      const r = p.getBoundingClientRect(), hx = rnd(r.left + r.width * 0.2, r.right - r.width * 0.2);
      add('fx', boltPath(hx + rnd(-120, 120), -10, hx, r.top, 0.18), 420, 2.8, 1);
      sparks(hx, r.top, 6, 40);
      crackles.push({ x1: r.left + 8, y1: r.top, x2: r.right - 8, y2: r.top, born: performance.now(), life: 700 });
      flash(hx, r.top, 0.6);
    }, delayMs + 300);
  }

  function draw(ctx, list, now) {
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i], t = (now - b.born) / b.life;
      if (t >= 1) { list.splice(i, 1); continue; }
      drawBolt(ctx, b.pts, b.a * (1 - t) * (Math.random() < 0.22 ? 0.35 : 1), b.w, b.branches);
    }
  }
  function drawFx(now) {
    sctx.clearRect(0, 0, sky.width, sky.height);
    fctx.clearRect(0, 0, fx.width, fx.height);
    draw(sctx, layers.sky, now);
    draw(fctx, layers.fx, now);
    drawTrail(now);
    for (let i = crackles.length - 1; i >= 0; i--) {
      const c = crackles[i], t = (now - c.born) / c.life;
      if (t >= 1) { crackles.splice(i, 1); continue; }
      const segs = 4, step = (c.x2 - c.x1) / segs;
      for (let k = 0; k < segs; k++) {
        if (Math.random() < 0.8) drawBolt(fctx, boltPath(c.x1 + step * k, c.y1, c.x1 + step * (k + 1), c.y2, 0.06), (1 - t) * 0.9, 1.4, false);
      }
    }
  }

  const pageObserver = new ResizeObserver(() => { sctx = fit(sky); fctx = fit(fx); });
  pageObserver.observe(sky);

  if (reduce) {
    // no motion: one calm ring, nothing else
    ringArcs().forEach((a) => drawBolt(zctx, a.pts, 0.5, 1.2, false));
  } else {
    on(window, 'pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const last = track(e.clientX, e.clientY, performance.now());
      if (last && Math.hypot(e.clientX - last.x, e.clientY - last.y) > 45 && Math.random() < 0.5) sparks(e.clientX, e.clientY, 3, 26);
    });
    on(document, 'pointerleave', () => { pointer.on = false; });
    const finger = (e) => { clearTimeout(touchOff); const t = e.touches[0]; if (t) track(t.clientX, t.clientY, performance.now()); };
    on(window, 'touchstart', finger, { passive: true });
    on(window, 'touchmove', finger, { passive: true });
    on(window, 'touchend', () => { touchOff = setTimeout(() => { pointer.on = false; }, 400); }, { passive: true });
    on(window, 'pointerdown', (e) => {
      const x = e.clientX, y = e.clientY, sx = x + rnd(-160, 160);
      add('fx', boltPath(sx, -10, x, y, 0.18), 380, 2.6, 1);
      sparks(x, y);
      flash(x, y, 0.5);
    });
    let lastY = scrollY, lastScrollBolt = 0;
    on(window, 'scroll', () => {
      const dy = scrollY - lastY;
      lastY = scrollY;
      const now = performance.now();
      if (Math.abs(dy) < 3 || now - lastScrollBolt < 100) return;
      lastScrollBolt = now;
      const dir = Math.sign(dy), len = Math.min(560, 160 + Math.abs(dy) * 6), a = Math.min(1, 0.5 + Math.abs(dy) / 60);
      if (pointer.on) {
        const { x, y } = pointer;
        add('fx', boltPath(x, y, x + rnd(-90, 90), y - dir * len, 0.14), 320, 2, a);
        sparks(x, y, 3, 30);
      }
      const left = Math.random() < 0.5, sx = left ? rnd(8, 70) : innerWidth - rnd(8, 70);
      const y1 = dir > 0 ? rnd(-40, innerHeight * 0.3) : rnd(innerHeight * 0.7, innerHeight + 40);
      add('fx', boltPath(sx, y1, sx + rnd(-40, 40), y1 + dir * len, 0.12), 300, 1.6, a * 0.7);
    }, { passive: true });
    on(window, 'portfolio:section', (e) => panelStrike(e.detail.section, e.detail.delayMs));

    loop(drawZap);
    loop(drawFx);
    later(bigStrike, 450);
    later(scheduleRing, 1400);
    later(skyStrike, 2500);
  }

  return function stop() {
    stopped = true;
    rafs.forEach(cancelAnimationFrame);
    timers.forEach(clearTimeout);
    clearTimeout(touchOff);
    listeners.forEach((off) => off());
    zapObserver.disconnect();
    pageObserver.disconnect();
  };
}
