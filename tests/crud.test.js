import { describe, expect, test } from 'vitest';
import { swapOrder } from '@/lib/admin/order';

const rows = [
  { id: 'a', sort_order: 0 },
  { id: 'b', sort_order: 1 },
];

describe('swapOrder', () => {
  test('moving the second row up swaps the two sort_orders', () => {
    expect(swapOrder(rows, 'b', 'up')).toEqual([
      { id: 'b', sort_order: 0 },
      { id: 'a', sort_order: 1 },
    ]);
  });
  test('the first row cannot move up', () => expect(swapOrder(rows, 'a', 'up')).toEqual([]));
  test('the last row cannot move down', () => expect(swapOrder(rows, 'b', 'down')).toEqual([]));
  test('rows with equal sort_order still get distinct values after a swap', () => {
    const same = [{ id: 'a', sort_order: 0 }, { id: 'b', sort_order: 0 }];
    const out = swapOrder(same, 'b', 'up');
    expect(out.find((r) => r.id === 'b').sort_order).toBeLessThan(out.find((r) => r.id === 'a').sort_order);
  });
  test('works when positions have gaps (0, 3, 5)', () => {
    const gappy = [{ id: 'a', sort_order: 0 }, { id: 'b', sort_order: 3 }, { id: 'c', sort_order: 5 }];
    expect(swapOrder(gappy, 'c', 'up')).toEqual([
      { id: 'c', sort_order: 3 },
      { id: 'b', sort_order: 5 },
    ]);
  });
});
