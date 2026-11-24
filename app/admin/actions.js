'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { getSection } from '@/lib/admin/schema';
import { requireAdmin } from '@/lib/supabase/server';
import { validate } from '@/lib/admin/validate';
import { applyUploads } from '@/lib/admin/uploads';
import { deleteRow, reorderRows, saveRow, setVisible } from '@/lib/admin/crud';
import { uploadMedia } from '@/lib/storage';
import { SITE_TAG } from '@/lib/site-content';
import { SAVE_FAILED } from '@/lib/admin/messages';

/** After any change: refresh the public site's cache and the dashboard list. */
function refresh(section) {
  updateTag(SITE_TAG);
  revalidatePath(section === 'categories' ? '/admin/projects' : `/admin/${section}`);
}

/**
 * Runs a database change and reports the result as { ok } instead of throwing,
 * so the dashboard can show a message. A sign-in redirect (expired session) still goes through.
 */
async function attempt(section, change) {
  try {
    await change();
  } catch (err) {
    unstable_rethrow(err);
    return { ok: false, error: SAVE_FAILED };
  }
  refresh(section);
  return { ok: true, at: Date.now() };
}

/** Used with useActionState: saveRowAction.bind(null, section, id) → (prevState, formData) */
export async function saveRowAction(section, id, _prev, formData) {
  await requireAdmin(); // first, before any upload or validation work
  const def = getSection(section);
  if (!def) return { ok: false, error: SAVE_FAILED };
  const values = Object.fromEntries(def.fields.map((f) => [f.name, formData.get(f.name)]));

  // image fields: a newly chosen file replaces the current URL; "remove" clears it
  const uploads = def.fields
    .filter((f) => f.type === 'image')
    .map((f) => ({ field: f.name, input: `${f.name}__file`, kind: 'image', folder: f.folder || 'projects' }));
  const uploadErrors = await applyUploads(formData, uploads, values, uploadMedia);
  if (Object.keys(uploadErrors).length) return { ok: false, errors: uploadErrors };

  const result = validate(section, values);
  if (!result.ok) return { ok: false, errors: result.errors };
  return attempt(section, () => saveRow(section, id, result.value));
}

export async function deleteRowAction(section, id) {
  return attempt(section, () => deleteRow(section, id));
}

/** Called when a row is dropped after dragging: ids = that group's rows in the new order. */
export async function reorderAction(section, ids) {
  return attempt(section, () => reorderRows(section, ids));
}

export async function setVisibleAction(section, id, visible) {
  return attempt(section, () => setVisible(section, id, visible));
}
