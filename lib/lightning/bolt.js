/**
 * A jagged lightning path between two points (midpoint displacement, 6 rounds → 65 points).
 * Each round splits every segment and pushes its middle sideways by up to ±offset; the offset halves each round.
 * `rough` sets the first offset as a fraction of the bolt's length. `rng` is injectable for tests.
 */
export function boltPath(x1, y1, x2, y2, rough, rng = Math.random) {
  const rnd = (a, b) => a + rng() * (b - a);
  let pts = [[x1, y1], [x2, y2]];
  let off = Math.hypot(x2 - x1, y2 - y1) * rough;
  for (let i = 0; i < 6; i++) {
    const next = [pts[0]];
    for (let j = 0; j < pts.length - 1; j++) {
      const [ax, ay] = pts[j];
      const [bx, by] = pts[j + 1];
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
      const o = rnd(-off, off);
      next.push([(ax + bx) / 2 - (dy / len) * o, (ay + by) / 2 + (dx / len) * o], pts[j + 1]);
    }
    pts = next;
    off /= 2;
  }
  return pts;
}
