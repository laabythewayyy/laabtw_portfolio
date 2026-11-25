'use client';

import { useActionState, useCallback, useEffect, useRef, useState } from 'react';
import Sortable from 'sortablejs';
import { saveSettings } from './actions';
import { renderBold } from '@/lib/format';
import DropZone from '@/components/admin/DropZone';
import Toast from '@/components/admin/Toast';
import Toggle from '@/components/admin/Toggle';
import { SAVED } from '@/lib/admin/messages';

const TABS = [
  ['home', 'Home'],
  ['about', 'About'],
  ['heads', 'Headings'],
  ['files', 'Photos & CV'],
  ['footer', 'Footer'],
];
const HEADERS = [['about', 'About'], ['resume', 'Resume'], ['projects', 'Projects'], ['contact', 'Contact']];
const BLOCKS = [['skills', 'In About'], ['build', 'In Projects (top)'], ['built', 'In Projects (cards)'], ['social', 'In Contact']];

function Text({ name, label, value, hint, area, onInput }) {
  return (
    <label className="f">
      <span>{label}</span>
      {area ? <textarea name={name} defaultValue={value} onInput={onInput} /> : <input type="text" name={name} defaultValue={value} onInput={onInput} />}
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

let factKey = 0;
function FactsEditor({ initial, onChange }) {
  const [facts, setFacts] = useState(() => (initial.length ? initial : [{ label: '', value: '' }]).map((f) => ({ ...f, k: ++factKey })));
  const box = useRef(null);
  const update = (next) => { setFacts(next); onChange(); };

  useEffect(() => {
    const s = Sortable.create(box.current, {
      handle: '.handle', animation: 200,
      onEnd(evt) {
        if (evt.oldIndex === evt.newIndex) return;
        const el = evt.item;
        el.remove();
        box.current.insertBefore(el, box.current.children[evt.oldIndex] ?? null);
        setFacts((f) => { const c = [...f]; const [m] = c.splice(evt.oldIndex, 1); c.splice(evt.newIndex, 0, m); return c; });
        onChange();
      },
    });
    return () => s.destroy();
  }, [onChange]);

  return (
    <div className="f">
      <span>Info list <span className="hint">Drag the handle to reorder.</span></span>
      <input type="hidden" name="about_facts" value={JSON.stringify(facts.map(({ label, value }) => ({ label, value })))} />
      <div className="facts" ref={box}>
        {facts.map((f, i) => (
          <div className="fact" key={f.k}>
            <div className="handle" aria-label="Drag to reorder"><i className="fa-solid fa-grip-vertical" aria-hidden="true" /></div>
            <input value={f.label} placeholder="Label, e.g. City" aria-label="Label"
              onChange={(e) => update(facts.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
            <input value={f.value} placeholder="Value, e.g. Phnom Penh" aria-label="Value"
              onChange={(e) => update(facts.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
            <button type="button" className="xbtn" aria-label="Remove line" onClick={() => update(facts.filter((_, j) => j !== i))}>
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-line btn-sm add-line"
        onClick={() => update([...facts, { label: '', value: '', k: ++factKey }])}>
        <i className="fa-solid fa-plus" aria-hidden="true" /> Add line
      </button>
    </div>
  );
}

/** All fields. Remounted (via key) on Discard so everything returns to the saved values. */
function Fields({ s, onDirty, onSaved }) {
  const [state, action, pending] = useActionState(saveSettings, {});
  const [tab, setTab] = useState('home');
  const [first, setFirst] = useState(s.first_name);
  const [last, setLast] = useState(s.last_name);
  const [lead, setLead] = useState(s.role_line);
  const [open, setOpen] = useState(!!s.open_to_work);
  const err = state?.errors || {};

  useEffect(() => { if (state?.ok) onSaved(); }, [state, onSaved]);
  // an upload problem lives on the Photos & CV tab: show it
  const fileError = err.avatar_url || err.about_image_url || err.cv_url;

  return (
    <form action={action} onInput={onDirty}>
      <div className="tabs" role="tablist">
        {TABS.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : undefined} onClick={() => setTab(k)}>
            {label}{k === 'files' && fileError ? ' ⚠' : ''}
          </button>
        ))}
      </div>

      <div className={`tab tab-home${tab === 'home' ? ' on' : ''}`}>
        <div className="preview" aria-label="Live preview">
          <small>Live preview</small>
          <div className="pname">{first} <span>{last}</span></div>
          <p className="plead" dangerouslySetInnerHTML={{ __html: renderBold(lead) }} />
        </div>
        <div className="card">
          <div className="two">
            <label className="f"><span>First name</span><input type="text" name="first_name" value={first} onChange={(e) => setFirst(e.target.value)} /></label>
            <label className="f"><span>Last name <span className="hint">(shown in red)</span></span><input type="text" name="last_name" value={last} onChange={(e) => setLast(e.target.value)} /></label>
          </div>
          <label className="f">
            <span>Short description</span>
            <textarea name="role_line" value={lead} onChange={(e) => setLead(e.target.value)} />
            <span className="hint">Put **double stars** around words to make them bold. The preview above updates as you type.</span>
          </label>
          <div className="switch-row">
            <div><b>&quot;Open to work&quot; badge</b><div className="hint">Shows under your avatar on the homepage.</div></div>
            <input type="hidden" name="open_to_work" value={open ? 'on' : ''} />
            <Toggle on={open} label='"Open to work" badge' onClick={() => { setOpen((x) => !x); onDirty(); }} />
          </div>
        </div>
      </div>

      <div className={`tab${tab === 'about' ? ' on' : ''}`}>
        <div className="card">
          <Text name="about_title" label="Title" value={s.about_title} />
          <Text name="about_body" label="Paragraph" value={s.about_body} area hint="**bold** works here too." />
          <FactsEditor initial={s.about_facts} onChange={onDirty} />
          <label className="f">
            <span>Second paragraph <span className="hint">(optional)</span></span>
            <textarea name="about_body_2" defaultValue={s.about_body_2} />
          </label>
        </div>
      </div>

      <div className={`tab tab-heads${tab === 'heads' ? ' on' : ''}`}>
        <div className="card">
          <h2>Section headings</h2>
          {HEADERS.map(([k, name]) => (
            <div className="two" key={k}>
              <Text name={`sh_${k}_label`} label={`${name}: small label`} value={s.section_headers[k].label} />
              <Text name={`sh_${k}_heading`} label={`${name}: big heading`} value={s.section_headers[k].heading} />
            </div>
          ))}
        </div>
        <div className="card">
          <h2>Smaller titles</h2>
          <div className="two">
            {BLOCKS.map(([k, name]) => <Text key={k} name={`bt_${k}`} label={name} value={s.block_titles[k]} />)}
          </div>
        </div>
      </div>

      <div className={`tab tab-files${tab === 'files' ? ' on' : ''}`}>
        <div className="card">
          <h2>Homepage avatar</h2>
          <DropZone fileName="avatar__file" removeName="avatar_url__remove" current={s.avatar_url} kind="image" onChange={onDirty}
            title="Drop a new image here, or click to choose" hint="JPG, PNG or WebP up to 5 MB. A transparent background looks best." />
          {err.avatar_url && <span className="field-error">{err.avatar_url}</span>}
        </div>
        <div className="card">
          <h2>About photo</h2>
          <DropZone fileName="about_image__file" removeName="about_image_url__remove" current={s.about_image_url} kind="image" onChange={onDirty}
            removeLabel="Use the homepage avatar instead"
            title={s.about_image_url ? 'Drop a new image here, or click to choose' : 'Using your homepage avatar. Drop a photo here to use a different one'}
            hint="Shown in the About section only. JPG, PNG or WebP up to 5 MB." />
          {err.about_image_url && <span className="field-error">{err.about_image_url}</span>}
        </div>
        <div className="card">
          <h2>CV</h2>
          <DropZone fileName="cv__file" removeName="cv_url__remove" current={s.cv_url} kind="pdf" onChange={onDirty}
            title={s.cv_url ? 'Your uploaded CV' : 'Default CV (portfolio-tola.pdf)'} hint="Drop a new PDF here, or click to choose. Up to 5 MB." />
          {err.cv_url && <span className="field-error">{err.cv_url}</span>}
        </div>
      </div>

      <div className={`tab${tab === 'footer' ? ' on' : ''}`}>
        <div className="card">
          <Text name="build_more_text" label='"Need something else?" line (Projects)' value={s.build_more_text} area />
          <Text name="copyright_text" label="Copyright line" value={s.copyright_text} />
          <Text name="site_title" label="Browser tab title" value={s.site_title} />
        </div>
      </div>

      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      <UnsavedBar pending={pending} />
    </form>
  );
}

/** Shown while there are unsaved edits (the parent toggles .on through the data attribute). */
function UnsavedBar({ pending }) {
  return (
    <div className="unsaved" data-unsaved>
      <span><b>You have unsaved changes.</b> <span className="hint">Nothing is saved until you click Save.</span></span>
      <span className="actions">
        <button type="button" className="btn btn-line" data-discard>Discard</button>
        <button type="submit" className="btn btn-red" disabled={pending}>{pending ? 'Saving…' : 'Save changes'}</button>
      </span>
    </div>
  );
}

export default function SettingsForm({ settings }) {
  const [dirty, setDirty] = useState(false);
  const [version, setVersion] = useState(0);
  const [toast, setToast] = useState(null);
  const onDirty = useCallback(() => setDirty(true), []);
  const onSaved = useCallback(() => { setDirty(false); setToast({ text: SAVED }); }, []);
  const clearToast = useCallback(() => setToast(null), []);

  // closing the tab or reloading with unsaved edits asks first
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  return (
    <div className={dirty ? 'is-dirty' : undefined}
      onClick={(e) => {
        if (e.target.closest('[data-discard]')) { setVersion((v) => v + 1); setDirty(false); setToast({ text: 'Changes discarded.' }); }
      }}>
      <Fields key={version} s={settings} onDirty={onDirty} onSaved={onSaved} />
      <Toast toast={toast} onDone={clearToast} />
    </div>
  );
}
