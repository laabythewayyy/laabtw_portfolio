'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { createClient, requireAdmin } from '@/lib/supabase/server';
import { parseSettingsForm } from '@/lib/admin/settings';
import { applyUploads } from '@/lib/admin/uploads';
import { uploadMedia } from '@/lib/storage';
import { SITE_TAG } from '@/lib/site-content';
import { SAVE_FAILED } from '@/lib/admin/messages';

const FILES = [
  { field: 'avatar_url', input: 'avatar__file', kind: 'image', folder: 'avatar' },
  { field: 'about_image_url', input: 'about_image__file', kind: 'image', folder: 'avatar' },
  { field: 'cv_url', input: 'cv__file', kind: 'pdf', folder: 'files' },
];

/** Saves the Site text form (row id = 1), including avatar and CV uploads. */
export async function saveSettings(_prev, formData) {
  await requireAdmin();
  const value = parseSettingsForm(formData);
  const errors = await applyUploads(formData, FILES, value, uploadMedia);
  if (Object.keys(errors).length) return { ok: false, errors };

  const supabase = await createClient();
  const { error } = await supabase.from('site_settings').update(value).eq('id', 1);
  if (error) return { ok: false, error: SAVE_FAILED };

  updateTag(SITE_TAG);
  revalidatePath('/admin/site');
  return { ok: true, at: Date.now() };
}
