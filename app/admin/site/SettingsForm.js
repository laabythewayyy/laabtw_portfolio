'use client';

import { useActionState, useCallback, useState } from 'react';
import { saveSettings } from './actions';
import Toast from '@/components/admin/Toast';

const HEADERS = [
  ['about', 'About'],
  ['resume', 'Resume'],
  ['projects', 'Projects'],
  ['contact', 'Contact'],
];
const BLOCKS = [
  ['skills', 'Skills (in About)'],
  ['build', 'What I can build for you (in Projects)'],
  ['built', "Things I've built (in Projects)"],
  ['social', 'Social media (in Contact)'],
];

function Text({ name, label, value, hint, area }) {
  return (
    <label>
      {label}
      {area ? <textarea name={name} defaultValue={value} /> : <input type="text" name={name} defaultValue={value} />}
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

function FactsEditor({ initial }) {
  const [facts, setFacts] = useState(initial.length ? initial : [{ label: '', value: '' }]);
  const set = (i, key, v) => setFacts((f) => f.map((x, j) => (j === i ? { ...x, [key]: v } : x)));
  const move = (i, d) =>
    setFacts((f) => {
      const j = i + d;
      if (j < 0 || j >= f.length) return f;
      const c = [...f];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
  return (
    <div className="facts-editor">
      <input type="hidden" name="about_facts" value={JSON.stringify(facts)} />
      {facts.map((f, i) => (
        <div className="fact" key={i}>
          <input type="text" aria-label="Label" placeholder="Label, e.g. City" value={f.label} onChange={(e) => set(i, 'label', e.target.value)} />
          <input type="text" aria-label="Value" placeholder="Value, e.g. Phnom Penh" value={f.value} onChange={(e) => set(i, 'value', e.target.value)} />
          <span style={{ display: 'flex', gap: 4 }}>
            <button type="button" className="icon-btn" aria-label="Move up" onClick={() => move(i, -1)}>▲</button>
            <button type="button" className="icon-btn" aria-label="Move down" onClick={() => move(i, 1)}>▼</button>
            <button type="button" className="icon-btn" aria-label="Remove line" onClick={() => setFacts((x) => x.filter((_, j) => j !== i))}>✕</button>
          </span>
        </div>
      ))}
      <button type="button" className="edit-btn" style={{ justifySelf: 'start' }} onClick={() => setFacts((f) => [...f, { label: '', value: '' }])}>
        Add line
      </button>
    </div>
  );
}

function FileField({ field, label, current, accept, hint, error, isImage }) {
  const [preview, setPreview] = useState(current || '');
  return (
    <div>
      <label>{label}</label>
      <div className="upload">
        {/* eslint-disable-next-line @next/next/no-img-element -- preview */}
        {isImage && preview && <img src={preview} alt="" />}
        {!isImage && current && (
          <a href={current} target="_blank" rel="noopener" className="hint">
            Current file
          </a>
        )}
        <input type="file" name={field === 'avatar_url' ? 'avatar__file' : 'cv__file'} accept={accept}
          onChange={(e) => { const f = e.target.files?.[0]; if (f && isImage) setPreview(URL.createObjectURL(f)); }} />
        {current && (
          <label className="check">
            <input type="checkbox" name={`${field}__remove`} /> <span>Use the default instead</span>
          </label>
        )}
      </div>
      <span className="hint">{hint}</span>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export default function SettingsForm({ settings: s }) {
  const [state, action, pending] = useActionState(saveSettings, {});
  // show the toast once per successful save (state.at is the save time)
  const [dismissedAt, setDismissedAt] = useState(0);
  const toast = state?.ok && state.at !== dismissedAt ? 'Changes saved. Your site is updated.' : '';
  const clear = useCallback(() => setDismissedAt(state?.at ?? 0), [state]);
  const err = state?.errors || {};

  return (
    <form action={action} className="adm-form">
      <section className="settings-group">
        <h2>Home</h2>
        <div className="two">
          <Text name="first_name" label="First name" value={s.first_name} />
          <Text name="last_name" label="Last name (shown in red)" value={s.last_name} />
        </div>
        <Text name="role_line" label="Short description" value={s.role_line} area hint="Wrap words in **double stars** to make them bold." />
        <FileField field="avatar_url" label="Avatar" current={s.avatar_url} accept="image/jpeg,image/png,image/webp" isImage
          hint="JPG, PNG or WebP with a transparent background works best. Up to 5 MB." error={err.avatar_url} />
        <label className="check">
          <input type="checkbox" name="open_to_work" defaultChecked={s.open_to_work} /> <span>Show the &quot;Open to work&quot; badge</span>
        </label>
        <FileField field="cv_url" label="CV (PDF)" current={s.cv_url} accept="application/pdf" hint="PDF, up to 5 MB." error={err.cv_url} />
      </section>

      <section className="settings-group">
        <h2>About</h2>
        <Text name="about_title" label="Title" value={s.about_title} />
        <Text name="about_body" label="Paragraph (before the info list)" value={s.about_body} area hint="**bold** works here too." />
        <div>
          <label>Info list</label>
          <FactsEditor initial={s.about_facts} />
        </div>
        <Text name="about_body_2" label="Paragraph (after the info list, optional)" value={s.about_body_2} area />
      </section>

      <section className="settings-group">
        <h2>Section headings</h2>
        {HEADERS.map(([k, name]) => (
          <div className="two" key={k}>
            <Text name={`sh_${k}_label`} label={`${name}: small label`} value={s.section_headers[k].label} />
            <Text name={`sh_${k}_heading`} label={`${name}: big heading`} value={s.section_headers[k].heading} />
          </div>
        ))}
        <h2 style={{ fontSize: 18, marginTop: 6 }}>Smaller titles</h2>
        <div className="two">
          {BLOCKS.map(([k, name]) => (
            <Text key={k} name={`bt_${k}`} label={name} value={s.block_titles[k]} />
          ))}
        </div>
      </section>

      <section className="settings-group">
        <h2>Projects, footer and page title</h2>
        <Text name="build_more_text" label='"Need something else?" line' value={s.build_more_text} area />
        <Text name="copyright_text" label="Copyright line" value={s.copyright_text} />
        <Text name="site_title" label="Browser tab title" value={s.site_title} />
      </section>

      {state?.error && <p className="form-error">{state.error}</p>}
      <button type="submit" className="btn btn-red" disabled={pending}>
        {pending ? 'Saving…' : 'Save changes'}
      </button>
      <Toast message={toast} onDone={clear} />
    </form>
  );
}
