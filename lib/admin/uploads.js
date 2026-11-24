import { validateUpload } from './validate';

/**
 * Applies the file inputs of a dashboard form to `value` (mutated in place).
 * For each spec { field, input, kind, folder }:
 *  - "<field>__remove" ticked → value[field] = null
 *  - a chosen file in `input` → checked, uploaded, and value[field] = its public URL
 * `upload(file, folder)` returns the URL (injected so this stays testable).
 * Returns { field: message } for every file that could not be used ({} when all went well).
 */
export async function applyUploads(form, specs, value, upload) {
  const errors = {};
  for (const { field, input, kind, folder } of specs) {
    if (form.get(`${field}__remove`) === 'on') value[field] = null;
    const file = form.get(input);
    if (!file || typeof file !== 'object' || !file.size) continue;
    const problem = validateUpload(file, kind);
    if (problem) {
      errors[field] = problem;
      continue;
    }
    try {
      value[field] = await upload(file, folder);
    } catch {
      errors[field] = 'Upload failed. Try again.';
    }
  }
  return errors;
}
