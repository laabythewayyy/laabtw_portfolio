'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { ADMIN_SECTIONS } from '@/lib/admin/schema';
import { validate, validateUpload } from '@/lib/admin/validate';
import { deleteRow, reorderRows, saveRow, setVisible } from '@/lib/admin/crud';
import { uploadMedia } from '@/lib/storage';
import { SITE_TAG } from '@/lib/site-content';

/** After any change: refresh the public site's cache and the dashboard list. */
function refresh(section) {
  updateTag(SITE_TAG);
  revalidatePath(section === 'categories' ? '/admin/projects' : `/admin/${section}`);
}

const FAILED = 'Could not save. Check your connection and try again.';

/** Used with useActionState: saveRowAction.bind(null, section, id) → (prevState, formData) */
export async function saveRowAction(section, id, _prev, formData) {
  const def = ADMIN_SECTIONS[section];
  if (!def) return { ok: false, error: FAILED };
  const values = Object.fromEntries(def.fields.map((f) => [f.name, formData.get(f.name)]));

  // image fields: a newly chosen file replaces the current URL; "remove" clears it
  for (const f of def.fields.filter((x) => x.type === 'image')) {
    const file = formData.get(`${f.name}__file`);
    if (formData.get(`${f.name}__remove`) === 'on') values[f.name] = '';
    if (file && typeof file === 'object' && file.size > 0) {
      const problem = validateUpload(file, 'image');
      if (problem) return { ok: false, errors: { [f.name]: problem } };
      try {
        values[f.name] = await uploadMedia(file, f.folder || 'projects');
      } catch {
        return { ok: false, errors: { [f.name]: 'Upload failed. Try again.' } };
      }
    }
  }

  const result = validate(section, values);
  if (!result.ok) return { ok: false, errors: result.errors };
  try {
    await saveRow(section, id, result.value);
  } catch {
    return { ok: false, error: FAILED };
  }
  refresh(section);
  return { ok: true, at: Date.now() };
}

export async function deleteRowAction(section, id) {
  await deleteRow(section, id);
  refresh(section);
}

/** Called when a row is dropped after dragging: ids = that group's rows in the new order. */
export async function reorderAction(section, ids) {
  await reorderRows(section, ids);
  refresh(section);
}

export async function setVisibleAction(section, id, visible) {
  await setVisible(section, id, visible);
  refresh(section);
}
