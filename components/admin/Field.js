'use client';

import { useState } from 'react';
import { ICONS } from '@/lib/admin/icons';
import DropZone from './DropZone';

function Label({ field, extra }) {
  return (
    <span>
      {field.label}
      {field.required ? ' *' : ''}
      {extra}
    </span>
  );
}

/** One form field from a schema definition: slider, choice buttons, icon picker, drop zone, switch or text. */
export default function Field({ field, value, error, options }) {
  const err = error && <span className="field-error">{error}</span>;
  const hint = field.hint && <span className="hint">{field.hint}</span>;

  switch (field.type) {
    case 'percent':
      return <Slider field={field} value={value} err={err} />;
    case 'select':
      return <Choice field={field} value={value} options={options} err={err} />;
    case 'icon':
      return <IconPicker field={field} value={value} err={err} />;
    case 'toggle':
      return <Switch field={field} value={value} />;
    case 'image':
      return (
        <div className="f">
          <Label field={field} />
          <DropZone fileName={`${field.name}__file`} urlName={field.name} removeName={`${field.name}__remove`} current={value} kind="image"
            title="Drop a screenshot here, or click to choose" />
          {err}
        </div>
      );
    case 'textarea':
    case 'bullets':
      return (
        <label className="f">
          <Label field={field} />
          <textarea name={field.name} defaultValue={field.type === 'bullets' ? (value ?? []).join('\n') : value ?? ''} />
          {hint}
          {err}
        </label>
      );
    default:
      return (
        <label className="f">
          <Label field={field} />
          <input type="text" inputMode={field.type === 'url' ? 'url' : undefined} name={field.name} defaultValue={value ?? ''}
            placeholder={field.type === 'url' ? 'https://' : undefined} />
          {hint}
          {err}
        </label>
      );
  }
}

function Slider({ field, value, err }) {
  const [v, setV] = useState(value ?? 50);
  return (
    <div className="f">
      <Label field={field} />
      <div className="slider-row">
        <input type="range" min="0" max="100" step="1" name={field.name} value={v} onChange={(e) => setV(e.target.value)} aria-label={field.label} />
        <span className="pct">{v}%</span>
      </div>
      <span className="hint">Drag the slider. The bar updates live.</span>
      {err}
    </div>
  );
}

function Choice({ field, value, options, err }) {
  const list = field.required ? options : [{ value: '', label: 'None' }, ...options];
  const [v, setV] = useState(value ?? (field.required ? list[0]?.value : ''));
  return (
    <div className="f">
      <Label field={field} />
      <input type="hidden" name={field.name} value={v ?? ''} />
      <div className="seg" role="radiogroup" aria-label={field.label}>
        {list.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === v} className={o.value === v ? 'on' : undefined} onClick={() => setV(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
      {err}
    </div>
  );
}

function IconPicker({ field, value, err }) {
  const [v, setV] = useState(value ?? '');
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const shown = ICONS.filter(([c, n]) => !query || n.toLowerCase().includes(query) || c.includes(query));
  return (
    <div className="f">
      <Label field={field} />
      <input type="hidden" name={field.name} value={v} />
      <div className="picker">
        <input type="text" placeholder="Search icons… e.g. insta, shop, code" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search icons" />
        <div className="icons">
          {shown.map(([c, n]) => (
            <button key={c} type="button" title={n} className={c === v ? 'on' : undefined} aria-pressed={c === v} onClick={() => setV(c)}>
              <i className={c} aria-hidden="true" />
              <span>{n.split(' ')[0]}</span>
            </button>
          ))}
          {shown.length === 0 && <p className="hint" style={{ gridColumn: '1/-1' }}>No icon found. Try another word.</p>}
        </div>
      </div>
      {err}
    </div>
  );
}

function Switch({ field, value }) {
  const [on, setOn] = useState(!!value);
  return (
    <div className="switch-row">
      <b>{field.label}</b>
      <input type="hidden" name={field.name} value={on ? 'on' : ''} />
      <button type="button" className={`toggle${on ? ' on' : ''}`} aria-pressed={on} onClick={() => setOn((x) => !x)}>
        <i aria-hidden="true" />
        <span>{on ? 'On' : 'Off'}</span>
      </button>
    </div>
  );
}
