'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { createClient, requireAdmin } from '@/lib/supabase/server';
import { parseSettingsForm } from '@/lib/admin/settings';
import { validateUpload } from '@/lib/admin/validate';
import { uploadMedia } from '@/lib/storage';
import { SITE_TAG } from '@/lib/site-content';

/** Saves the Site text form (row id = 1), including avatar and CV uploads. */
export async function saveSettings(_prev, formData) {
  await requireAdmin();
  const value = parseSettingsForm(formData);
  const errors = {};

  const files = [
    { field: 'avatar_url', input: 'avatar__file', kind: 'image', folder: 'avatar' },
    { field: 'cv_url', input: 'cv__file', kind: 'pdf', folder: 'files' },
  ];
  for (const f of files) {
    if (formData.get(`${f.field}__remove`) === 'on') value[f.field] = null;
    const file = formData.get(f.input);
    if (file && typeof file === 'object' && file.size > 0) {
      const problem = validateUpload(file, f.kind);
      if (problem) { errors[f.field] = problem; continue; }
      try {
        value[f.field] = await uploadMedia(file, f.folder);
      } catch {
        errors[f.field] = 'Upload failed. Try again.';
      }
    }
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  const supabase = await createClient();
  const { error } = await supabase.from('site_settings').update(value).eq('id', 1);
  if (error) return { ok: false, error: 'Could not save. Check your connection and try again.' };

  updateTag(SITE_TAG);
  revalidatePath('/admin/site');
  return { ok: true, at: Date.now() };
}
