import { DEFAULT_SETTINGS } from '@/lib/content';

const TEXT_FIELDS = [
  'first_name', 'last_name', 'role_line', 'about_title', 'about_body', 'about_body_2',
  'build_more_text', 'copyright_text', 'site_title',
];
const HEADER_KEYS = ['about', 'resume', 'projects', 'contact'];
const BLOCK_KEYS = ['skills', 'build', 'built', 'social'];

const str = (v) => (v == null ? '' : String(v).trim());

function parseFacts(raw) {
  try {
    const list = JSON.parse(raw || '[]');
    if (!Array.isArray(list)) return [];
    return list
      .map((f) => ({ label: str(f?.label), value: str(f?.value) }))
      .filter((f) => f.label);
  } catch {
    return [];
  }
}

/**
 * Turns the Site text form into the site_settings update (files are handled separately).
 * `form` only needs get(name). Empty headers/titles fall back to the defaults so nothing ever goes blank.
 */
export function parseSettingsForm(form) {
  const v = {};
  for (const k of TEXT_FIELDS) v[k] = str(form.get(k));
  v.open_to_work = form.get('open_to_work') === 'on';
  v.about_facts = parseFacts(form.get('about_facts'));
  v.section_headers = Object.fromEntries(
    HEADER_KEYS.map((k) => [
      k,
      {
        label: str(form.get(`sh_${k}_label`)) || DEFAULT_SETTINGS.section_headers[k].label,
        heading: str(form.get(`sh_${k}_heading`)) || DEFAULT_SETTINGS.section_headers[k].heading,
      },
    ]),
  );
  v.block_titles = Object.fromEntries(BLOCK_KEYS.map((k) => [k, str(form.get(`bt_${k}`)) || DEFAULT_SETTINGS.block_titles[k]]));
  return v;
}
