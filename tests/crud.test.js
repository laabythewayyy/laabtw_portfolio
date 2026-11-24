import { describe, expect, test } from 'vitest';
import { applyGroupOrder } from '@/lib/admin/order';

// whole table, already sorted by sort_order
const all = [
  { id: 'e1', kind: 'education' },
  { id: 'w1', kind: 'work' },
  { id: 'e2', kind: 'education' },
  { id: 'a1', kind: 'achievement' },
  { id: 'w2', kind: 'work' },
];

describe('applyGroupOrder', () => {
  test('a simple list is renumbered 0..n-1 in the dragged order', () => {
    const rows = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(applyGroupOrder(rows, ['c', 'a', 'b'])).toEqual([
      { id: 'c', sort_order: 0 },
      { id: 'a', sort_order: 1 },
      { id: 'b', sort_order: 2 },
    ]);
  });

  test('reordering one group keeps the other groups in their slots', () => {
    const out = applyGroupOrder(all, ['w2', 'w1'], (r) => r.kind === 'work');
    expect(out.map((r) => r.id)).toEqual(['e1', 'w2', 'e2', 'a1', 'w1']);
    expect(out.map((r) => r.sort_order)).toEqual([0, 1, 2, 3, 4]);
  });

  test('unknown ids in the new order are ignored', () => {
    const rows = [{ id: 'a' }, { id: 'b' }];
    expect(applyGroupOrder(rows, ['b', 'ghost', 'a']).map((r) => r.id)).toEqual(['b', 'a']);
  });

  test('an order that leaves out some of the group keeps them after the listed ones', () => {
    const rows = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(applyGroupOrder(rows, ['c']).map((r) => r.id)).toEqual(['c', 'a', 'b']);
  });
});
