'use client';

import { useActionState, useEffect } from 'react';
import { ADMIN_SECTIONS } from '@/lib/admin/schema';
import { deleteRowAction, saveRowAction } from '@/app/admin/actions';
import Field from './Field';

/** Right-side panel with the add/edit form for one row. Full screen on phones. */
export default function Drawer({ section, row, categories = [], onClose, onSaved }) {
  const def = ADMIN_SECTIONS[section];
  const [state, action, pending] = useActionState(saveRowAction.bind(null, section, row?.id ?? null), {});

  useEffect(() => {
    if (state?.ok) onSaved();
  }, [state, onSaved]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const optionsFor = (f) => (f.options === 'categories' ? categories.map((c) => ({ value: c.id, label: c.name })) : f.options);
  const title = row ? `Edit ${def.noun}` : def.addLabel;

  async function remove() {
    if (!confirm(`Delete this ${def.noun}? This can't be undone.`)) return;
    await deleteRowAction(section, row.id);
    onSaved(`Deleted. Your site is updated.`);
  }

  return (
    <>
      <div className="drawer-back" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <form action={action} style={{ display: 'contents' }}>
          <header>
            <h2>{title}</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </header>
          <div className="body">
            {def.fields.map((f) => (
              <Field key={f.name} field={f} value={row?.[f.name]} error={state?.errors?.[f.name]} options={optionsFor(f)} />
            ))}
            {state?.error && <p className="form-error">{state.error}</p>}
          </div>
          <footer>
            <button type="submit" className="btn btn-red" disabled={pending}>
              {pending ? 'Saving…' : 'Save changes'}
            </button>
            {row && (
              <button type="button" className="btn btn-danger" onClick={remove} disabled={pending}>
                Delete {def.noun}
              </button>
            )}
          </footer>
        </form>
      </aside>
    </>
  );
}
