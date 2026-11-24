import 'server-only';
import { createClient, requireAdmin } from '@/lib/supabase/server';
import { getSection } from './schema';
import { applyGroupOrder } from './order';

const sectionOf = (section) => {
  const def = getSection(section);
  if (!def) throw new Error(`Unknown section: ${section}`);
  return def;
};
const tableOf = (section) => sectionOf(section).table;

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
 * Save a dragged order. `ids` is one group's rows in their new order (group = the kind for resume/contacts,
 * the whole list otherwise). The whole table is renumbered 0..n-1, so the order can never get scrambled.
 */
export async function reorderRows(section, ids) {
  await requireAdmin();
  const supabase = await createClient();
  const def = sectionOf(section);
  const table = def.table;
  const cols = 'id, sort_order' + (def.groupBy ? `, ${def.groupBy}` : '');
  const { data: rows, error } = await supabase.from(table).select(cols).order('sort_order').order('created_at');
  if (error) throw new Error(error.message);
  const first = rows.find((r) => r.id === ids[0]);
  if (!first) return;
  const inGroup = def.groupBy ? (r) => r[def.groupBy] === first[def.groupBy] : undefined;
  const next = applyGroupOrder(rows, ids, inGroup);
  for (const { id, sort_order } of next) {
    if (rows.find((r) => r.id === id).sort_order === sort_order) continue;
    const { error: e } = await supabase.from(table).update({ sort_order }).eq('id', id);
    if (e) throw new Error(e.message);
  }
}
