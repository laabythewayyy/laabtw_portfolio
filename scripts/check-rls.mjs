// Proves that a stranger (using only the public key) cannot change anything
// and cannot read hidden rows. Run: node scripts/check-rls.mjs
// Exits with code 1 if any check fails.
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const env = {};
  for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

let failed = 0;
const report = (ok, label) => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (!ok) failed++;
};

// 0. The schema must exist, otherwise "insert rejected" would pass for the wrong reason.
const schema = await supabase.from('site_settings').select('id').limit(1);
report(!schema.error, `schema exists${schema.error ? ` (${schema.error.message})` : ''}`);

// 1. insert is rejected
const ins = await supabase.from('skills').insert({ name: 'rls-check', percent: 1 }).select();
report(!!ins.error || (ins.data ?? []).length === 0, 'anon cannot insert');

// 2. update changes nothing
const upd = await supabase.from('site_settings').update({ site_title: 'hacked' }).eq('id', 1).select();
report(!!upd.error || (upd.data ?? []).length === 0, 'anon cannot update settings');

// 3. delete removes nothing
const del = await supabase.from('projects').delete().not('id', 'is', null).select();
report(!!del.error || (del.data ?? []).length === 0, 'anon cannot delete');

// 4. hidden rows are not readable
const hidden = await supabase.from('projects').select('id').eq('is_visible', false);
report(!hidden.error && hidden.data.length === 0, 'hidden rows not readable');

// 5. storage upload is rejected
const up = await supabase.storage.from('media').upload(`rls-check-${Date.now()}.txt`, new Blob(['x']), {
  contentType: 'text/plain',
});
report(!!up.error, 'anon cannot upload');

process.exit(failed ? 1 : 0);
