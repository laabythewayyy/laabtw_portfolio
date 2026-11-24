import { ADMIN_SECTIONS } from './schema';

const MESSAGES = {
  name: 'Add a name.',
  title: 'Add a title.',
  required: 'This field is required.',
  percent: 'Enter a number from 0 to 100.',
  url: 'Enter a full link starting with https://',
  icon: 'Use a Font Awesome class like fa-brands fa-github.',
  kind: 'Choose Education, Work experience or Achievement.',
  choice: 'Choose one of the options.',
  imageSize: 'Images must be 5 MB or smaller.',
  imageType: 'Upload a JPG, PNG or WebP image.',
  pdfType: 'Upload a PDF file.',
  pdfSize: 'Files must be 5 MB or smaller.',
};

const URL_RE = /^(https?:\/\/\S+|mailto:\S+|tel:[+0-9 ()-]+)$/i;
const ICON_RE = /^fa-(solid|regular|brands) fa-[a-z0-9-]+$/;
const MAX_BYTES = 5 * 1024 * 1024;

const requiredMessage = (field, section) => {
  if (field.name === 'name') return MESSAGES.name;
  if (field.name === 'title') return MESSAGES.title;
  if (field.name === 'kind' && section === 'resume') return MESSAGES.kind;
  return MESSAGES.required;
};

/** Checks and cleans one field. Returns [value, errorMessage|null]. */
function check(field, raw, section) {
  const text = raw == null ? '' : String(raw).trim();
  switch (field.type) {
    case 'percent': {
      if (!/^-?\d+(\.\d+)?$/.test(text)) return [null, MESSAGES.percent];
      const n = Number(text);
      if (n < 0 || n > 100) return [null, MESSAGES.percent];
      return [Math.round(n), null];
    }
    case 'url':
      if (!text) return [null, field.required ? requiredMessage(field, section) : null];
      return URL_RE.test(text) ? [text, null] : [null, MESSAGES.url];
    case 'icon':
      if (!text) return ['', null];
      return ICON_RE.test(text) ? [text, null] : [null, MESSAGES.icon];
    case 'select': {
      if (field.options === 'categories') return [text || null, null]; // a category id, or none
      if (!text && !field.required) return [null, null];
      const ok = field.options.some((o) => o.value === text);
      return ok ? [text, null] : [null, field.name === 'kind' && section === 'resume' ? MESSAGES.kind : MESSAGES.choice];
    }
    case 'bullets':
      return [text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean), null];
    case 'toggle':
      return [raw === true || raw === 'on' || raw === 'true', null];
    case 'image':
      return [text || null, null];
    default: // text, textarea
      if (!text && field.required) return [null, requiredMessage(field, section)];
      return [text, null];
  }
}

/** Validates a dashboard form for one section. → { ok: true, value } or { ok: false, errors: { field: message } } */
export function validate(section, values) {
  const def = ADMIN_SECTIONS[section];
  if (!def) throw new Error(`Unknown section: ${section}`);
  const value = {};
  const errors = {};
  for (const field of def.fields) {
    const [v, err] = check(field, values[field.name], section);
    if (err) errors[field.name] = err;
    else value[field.name] = v;
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}

/** Checks an uploaded file. → error message, or null when it's fine. */
export function validateUpload(file, kind) {
  if (kind === 'pdf') {
    if (file.type !== 'application/pdf') return MESSAGES.pdfType;
    return file.size > MAX_BYTES ? MESSAGES.pdfSize : null;
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return MESSAGES.imageType;
  return file.size > MAX_BYTES ? MESSAGES.imageSize : null;
}
