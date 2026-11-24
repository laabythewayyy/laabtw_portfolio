import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { shapeContent } from '@/lib/content';
import Loading from '@/components/admin/Loading';
import SettingsForm from './SettingsForm';

/** Loads the saved settings (request time), merged with defaults so every field has a value. */
async function Form() {
  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
  const { settings } = shapeContent({ settings: data, skills: [], resume: [], build: [], categories: [], projects: [], contacts: [] });
  return <SettingsForm settings={settings} />;
}

export default function SiteTextPage() {
  return (
    <>
      <div className="head">
        <div>
          <h1>Site text</h1>
          <p className="sub">Your name, description, avatar, About text, headings and CV.</p>
        </div>
      </div>
      <Suspense fallback={<Loading />}>
        <Form />
      </Suspense>
    </>
  );
}
