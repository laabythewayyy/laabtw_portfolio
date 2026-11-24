import { createClient } from '@/lib/supabase/server';
import { shapeContent } from '@/lib/content';
import SettingsForm from './SettingsForm';

export default async function SiteTextPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
  // merge with defaults so every field has a value to show
  const { settings } = shapeContent({ settings: data, skills: [], resume: [], build: [], categories: [], projects: [], contacts: [] });
  return (
    <>
      <div className="head">
        <div>
          <h1>Site text</h1>
          <p className="sub">Your name, description, avatar, About text, headings and CV.</p>
        </div>
      </div>
      <SettingsForm settings={settings} />
    </>
  );
}
