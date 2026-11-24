/**
 * After a drag: give every row its new sort_order.
 * `rows` is the whole table in its current order. `order` is the ids of one group in their new, dragged order.
 * `inGroup(row)` says which rows belong to that group (default: all). Rows of other groups keep their slots;
 * the group's rows fill the group's slots in the new order (ids not listed keep their relative order after the listed ones).
 * Returns every row as { id, sort_order } with sort_order = 0..n-1.
 */
export function applyGroupOrder(rows, order, inGroup = () => true) {
  const group = rows.filter(inGroup);
  const groupIds = new Set(group.map((r) => r.id));
  const listed = order.filter((id) => groupIds.has(id));
  const rest = group.map((r) => r.id).filter((id) => !listed.includes(id));
  const queue = [...listed, ...rest];
  const result = rows.map((r) => (inGroup(r) ? queue.shift() : r.id));
  return result.map((id, i) => ({ id, sort_order: i }));
}
