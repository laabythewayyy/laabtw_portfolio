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
