'use client';

import { useState } from 'react';

/** One form field, drawn from a schema field definition. `options` is the resolved list for select fields. */
export default function Field({ field, value, error, options }) {
  const id = `f-${field.name}`;
  const label = (
    <span>
      {field.label}
      {field.required ? ' *' : ''}
    </span>
  );
  const hint = field.hint && <span className="hint">{field.hint}</span>;
  const err = error && <span className="field-error">{error}</span>;

  switch (field.type) {
    case 'textarea':
      return (
        <label htmlFor={id}>
          {label}
          <textarea id={id} name={field.name} defaultValue={value ?? ''} />
          {hint}
          {err}
        </label>
      );
    case 'bullets':
      return (
        <label htmlFor={id}>
          {label}
          <textarea id={id} name={field.name} defaultValue={(value ?? []).join('\n')} />
          {hint}
          {err}
        </label>
      );
    case 'percent':
      return <PercentField id={id} field={field} value={value} label={label} hint={hint} err={err} />;
    case 'icon':
      return <IconField id={id} field={field} value={value} label={label} hint={hint} err={err} />;
    case 'select':
      return (
        <label htmlFor={id}>
          {label}
          <select id={id} name={field.name} defaultValue={value ?? ''}>
            {!field.required && <option value="">None</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {hint}
          {err}
        </label>
      );
    case 'toggle':
      return (
        <label htmlFor={id} className="check">
          <input id={id} type="checkbox" name={field.name} defaultChecked={!!value} />
          <span>{field.label}</span>
        </label>
      );
    case 'image':
      return <ImageField id={id} field={field} value={value} label={label} err={err} />;
    case 'url':
      return (
        <label htmlFor={id}>
          {label}
          <input id={id} type="text" inputMode="url" name={field.name} defaultValue={value ?? ''} placeholder="https://" />
          {hint}
          {err}
        </label>
      );
    default:
      return (
        <label htmlFor={id}>
          {label}
          <input id={id} type="text" name={field.name} defaultValue={value ?? ''} />
          {hint}
          {err}
        </label>
      );
  }
}

function PercentField({ id, field, value, label, hint, err }) {
  const [v, setV] = useState(value ?? '');
  const n = Math.min(100, Math.max(0, Number(v) || 0));
  return (
    <label htmlFor={id}>
      {label}
      <input id={id} type="number" min="0" max="100" name={field.name} value={v} onChange={(e) => setV(e.target.value)} />
      <span className="percent-preview" aria-hidden="true">
        <i style={{ width: `${n}%` }} />
      </span>
      {hint}
      {err}
    </label>
  );
}

function IconField({ id, field, value, label, hint, err }) {
  const [v, setV] = useState(value ?? '');
  return (
    <label htmlFor={id}>
      {label}
      <span className="icon-preview">
        <i className={v} aria-hidden="true" />
        <input id={id} type="text" name={field.name} value={v} onChange={(e) => setV(e.target.value)} placeholder="fa-brands fa-github" />
      </span>
      {hint}
      {err}
    </label>
  );
}

function ImageField({ id, field, value, label, err }) {
  const [preview, setPreview] = useState(value || '');
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <div className="upload">
        {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
        {preview && <img src={preview} alt="" />}
        <input
          id={id}
          type="file"
          name={`${field.name}__file`}
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPreview(URL.createObjectURL(f));
          }}
        />
        <input type="hidden" name={field.name} value={value ?? ''} />
        {value && (
          <label className="check">
            <input type="checkbox" name={`${field.name}__remove`} /> <span>Remove image</span>
          </label>
        )}
      </div>
      <span className="hint">JPG, PNG or WebP, up to 5 MB.</span>
      {err}
    </div>
  );
}
