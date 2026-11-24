import 'server-only';
import { createClient, requireAdmin } from '@/lib/supabase/server';

/** Uploads a file to the "media" bucket (admin only) and returns its public URL. folder: avatar | projects | files */
export async function uploadMedia(file, folder) {
  await requireAdmin();
  const supabase = await createClient();
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '') || 'file';
  const path = `${folder}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from('media').upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}
