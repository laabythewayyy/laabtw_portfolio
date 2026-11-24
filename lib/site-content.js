import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { createClient as createSupabase } from '@supabase/supabase-js';
import { shapeContent } from '@/lib/content';

/** Cache tag for everything the public page shows. Admin actions call updateTag(SITE_TAG) after saving. */
export const SITE_TAG = 'site-content';

/**
 * Loads all public content. Cached on the server until an admin edit expires the tag.
 * Uses the public key with no cookies, so RLS returns visible rows only.
 */
export async function getSiteContent() {
  'use cache';
  cacheTag(SITE_TAG);
  cacheLife('max');

  const db = createSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  const list = async (table) => {
    const { data, error } = await db.from(table).select('*').order('sort_order');
    if (error) throw new Error(`Loading ${table} failed: ${error.message}`);
    return data;
  };
  const [settingsRes, skills, resume, build, categories, projects, contacts] = await Promise.all([
    db.from('site_settings').select('*').eq('id', 1).maybeSingle(),
    list('skills'),
    list('resume_entries'),
    list('build_items'),
    list('project_categories'),
    list('projects'),
    list('contacts'),
  ]);
  if (settingsRes.error) throw new Error(`Loading settings failed: ${settingsRes.error.message}`);

  return shapeContent({ settings: settingsRes.data, skills, resume, build, categories, projects, contacts });
}
