import 'server-only';
import { createClient, requireAdmin } from '@/lib/supabase/server';
import { ADMIN_SECTIONS } from './schema';
import { swapOrder } from './order';

const tableOf = (section) => {
  const def = ADMIN_SECTIONS[section];
  if (!def) throw new Error(`Unknown section: ${section}`);
  return def.table;
};

/** All rows of a section, hidden ones included (the admin session can see them). */
export async function listRows(section) {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.from(tableOf(section)).select('*').order('sort_order').order('created_at');
  if (error) throw new Error(error.message);
  return data;
}

/** Insert (id null → added at the end) or update one row. */
export async function saveRow(section, id, value) {
  await requireAdmin();
  const supabase = await createClient();
  const table = tableOf(section);
  if (id) {
    const { error } = await supabase.from(table).update(value).eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const { data: last } = await supabase.from(table).select('sort_order').order('sort_order', { ascending: false }).limit(1);
  const sort_order = last?.length ? last[0].sort_order + 1 : 0;
  const { error } = await supabase.from(table).insert({ ...value, sort_order });
  if (error) throw new Error(error.message);
}

export async function deleteRow(section, id) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from(tableOf(section)).delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function setVisible(section, id, visible) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from(tableOf(section)).update({ is_visible: visible }).eq('id', id);
  if (error) throw new Error(error.message);
}

/**
 * Move a row up/down past its neighbour in the same group (e.g. within "Education" for resume).
 * The whole table is renumbered 0..n-1 first, so gaps or duplicate sort_orders can never scramble the order.
 */
export async function moveRow(section, id, dir) {
  await requireAdmin();
  const supabase = await createClient();
  const table = tableOf(section);
  const def = ADMIN_SECTIONS[section];
  const { data: rows, error } = await supabase.from(table).select('id, sort_order' + (def.groupBy ? `, ${def.groupBy}` : '')).order('sort_order').order('created_at');
  if (error) throw new Error(error.message);
  const me = rows.find((r) => r.id === id);
  if (!me) return;
  const inGroup = (r) => !def.groupBy || r[def.groupBy] === me[def.groupBy];
  const positions = rows.map((r, i) => ({ id: r.id, sort_order: i }));
  const group = positions.filter((_, i) => inGroup(rows[i]));
  const swap = swapOrder(group, id, dir); // the two rows' positions, exchanged
  if (!swap.length) return;
  const next = new Map(positions.map((p) => [p.id, p.sort_order]));
  for (const s of swap) next.set(s.id, s.sort_order);
  for (const r of rows) {
    if (r.sort_order === next.get(r.id)) continue;
    const { error: e } = await supabase.from(table).update({ sort_order: next.get(r.id) }).eq('id', r.id);
    if (e) throw new Error(e.message);
  }
}
