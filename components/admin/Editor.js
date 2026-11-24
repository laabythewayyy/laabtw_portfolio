'use client';

import { useActionState, useEffect } from 'react';
import { ADMIN_SECTIONS } from '@/lib/admin/schema';
import { deleteRowAction, saveRowAction } from '@/app/admin/actions';
import Field from './Field';

/** The add/edit form that opens right under a row. */
export default function Editor({ section, row, categories = [], onClose, onSaved }) {
  const def = ADMIN_SECTIONS[section];
  const [state, action, pending] = useActionState(saveRowAction.bind(null, section, row?.id ?? null), {});

  useEffect(() => {
    if (state?.ok) onSaved();
  }, [state, onSaved]);

  const optionsFor = (f) => (f.options === 'categories' ? categories.map((c) => ({ value: c.id, label: c.name })) : f.options);

  async function remove() {
    if (!confirm(`Delete this ${def.noun}? This can't be undone.`)) return;
    await deleteRowAction(section, row.id);
    onSaved('Deleted. Your site is updated.');
  }

  return (
    <form action={action} className="editor-inner">
      {def.fields.map((f) => (
        <Field key={f.name} field={f} value={row?.[f.name]} error={state?.errors?.[f.name]} options={optionsFor(f)} />
      ))}
      {state?.error && <p className="form-error">{state.error}</p>}
      <div className="actions">
        <button type="submit" className="btn btn-red" disabled={pending}>{pending ? 'Saving…' : 'Save changes'}</button>
        <button type="button" className="btn btn-line" onClick={onClose} disabled={pending}>Cancel</button>
        {row && (
          <button type="button" className="del" onClick={remove} disabled={pending}>Delete</button>
        )}
      </div>
    </form>
  );
}
