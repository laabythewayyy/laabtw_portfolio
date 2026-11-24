/**
 * Move one row up or down by exchanging sort_order with its neighbour.
 * Returns the two rows' new {id, sort_order}, or [] when the row is already at that end.
 * Works with gaps (0, 3, 5…). If both rows had the same sort_order, they get distinct values.
 */
export function swapOrder(rows, id, dir) {
  const sorted = [...rows].sort((a, b) => a.sort_order - b.sort_order);
  const i = sorted.findIndex((r) => r.id === id);
  const j = dir === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= sorted.length) return [];
  const moved = sorted[i], other = sorted[j];
  if (moved.sort_order !== other.sort_order) {
    return [
      { id: moved.id, sort_order: other.sort_order },
      { id: other.id, sort_order: moved.sort_order },
    ];
  }
  const v = moved.sort_order;
  return [
    { id: moved.id, sort_order: dir === 'up' ? v : v + 1 },
    { id: other.id, sort_order: dir === 'up' ? v + 1 : v },
  ];
}
