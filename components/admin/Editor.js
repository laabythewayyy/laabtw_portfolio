'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ADMIN_SECTIONS } from '@/lib/admin/schema';
import { DELETED } from '@/lib/admin/messages';
import { deleteRowAction, saveRowAction } from '@/app/admin/actions';
import Field from './Field';

/** The add/edit form that opens right under a row. */
export default function Editor({ section, row, categories = [], onClose, onSaved }) {
  const def = ADMIN_SECTIONS[section];
  const router = useRouter();
  const [state, action, pending] = useActionState(saveRowAction.bind(null, section, row?.id ?? null), {});
  const [deleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState('');
  const busy = pending || deleting;

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
      onSaved();
    }
  }, [state, onSaved, router]);

  const optionsFor = (f) => (f.options === 'categories' ? categories.map((c) => ({ value: c.id, label: c.name })) : f.options);

  function remove() {
    if (!confirm(`Delete this ${def.noun}? This can't be undone.`)) return;
    startDelete(async () => {
      const r = await deleteRowAction(section, row.id);
      if (!r?.ok) { setDeleteError(r?.error || 'Could not delete. Try again.'); return; }
      router.refresh();
      onSaved(DELETED);
    });
  }

  const error = state?.error || deleteError;
  return (
    <form action={action} className="editor-inner" onKeyDown={(e) => e.key === 'Escape' && !busy && onClose()}>
      {def.fields.map((f) => (
        <Field key={f.name} field={f} value={row?.[f.name]} error={state?.errors?.[f.name]} options={optionsFor(f)} />
      ))}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="actions">
        <button type="submit" className="btn btn-red" disabled={busy}>{pending ? 'Saving…' : 'Save changes'}</button>
        <button type="button" className="btn btn-line" onClick={onClose} disabled={busy}>Cancel</button>
        {row && (
          <button type="button" className="del" onClick={remove} disabled={busy}>{deleting ? 'Deleting…' : 'Delete'}</button>
        )}
      </div>
    </form>
  );
}
