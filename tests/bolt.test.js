import { describe, expect, test } from 'vitest';
import { boltPath } from '@/lib/lightning/bolt';

describe('boltPath', () => {
  test('has 65 points and keeps both endpoints exactly', () => {
    const pts = boltPath(0, 0, 100, 0, 0.2);
    expect(pts).toHaveLength(65);
    expect(pts[0]).toEqual([0, 0]);
    expect(pts[64]).toEqual([100, 0]);
  });

  test('with a random source fixed at the middle there is no displacement', () => {
    const pts = boltPath(0, 0, 100, 0, 0.2, () => 0.5);
    expect(pts.every(([, y]) => y === 0)).toBe(true);
  });
});

describe('strokeBolt', () => {
  test('draws a wide gold glow, then a thin white core, along the points', async () => {
    const { strokeBolt } = await import('@/lib/lightning/bolt');
    const strokes = [];
    const ctx = {
      beginPath() {}, moveTo() {}, lineTo() {},
      stroke() { strokes.push({ w: this.lineWidth, col: this.strokeStyle }); },
    };
    strokeBolt(ctx, [[0, 0], [5, 5], [10, 10]], 1, 2);
    expect(strokes).toEqual([
      { w: 6, col: 'rgba(255,170,0,0.35)' },
      { w: 2, col: 'rgba(255,248,220,1)' },
    ]);
    expect(ctx.shadowBlur).toBe(0);
  });
});
