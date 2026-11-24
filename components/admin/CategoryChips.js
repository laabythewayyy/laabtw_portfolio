'use client';

import { useRef, useState } from 'react';
import { deleteRowAction, saveRowAction } from '@/app/admin/actions';
import { useAdminAction } from './useAdminAction';
import Toast from './Toast';

/** Project categories as chips: ✕ removes one (its projects stay, uncategorised), the box adds a new one. */
export default function CategoryChips({ categories }) {
  const input = useRef(null);
  const [error, setError] = useState('');
  const { run, busy, toast, clearToast } = useAdminAction();

  function add(e) {
    e.preventDefault();
    const name = input.current.value.trim();
    if (!name) return;
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setError('That category already exists.');
      return;
    }
    setError('');
    const fd = new FormData();
    fd.set('name', name);
    run(async () => {
      const r = await saveRowAction('categories', null, {}, fd);
      if (r.errors) return { ok: false, error: r.errors.name };
      if (r.ok) input.current.value = '';
      return r;
    }, 'Category added.');
  }

  function remove(c) {
    if (!confirm(`Remove the category "${c.name}"? Its projects stay, without a category.`)) return;
    run(() => deleteRowAction('categories', c.id), 'Category removed.');
  }

  return (
    <div className="card cats">
      <h2>Categories</h2>
      <p className="hint">These become the filter buttons on your site. Removing one keeps its projects.</p>
      <div className="chips">
        {categories.map((c) => (
          <span className="chip" key={c.id}>
            {c.name}
            <button type="button" aria-label={`Remove ${c.name}`} disabled={busy} onClick={() => remove(c)}>
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </span>
        ))}
        <form className="chip-add" onSubmit={add}>
          <input ref={input} placeholder="New category" aria-label="New category" maxLength={40} />
          <button className="btn btn-line btn-sm" disabled={busy}>Add</button>
        </form>
      </div>
      {error && <span className="field-error">{error}</span>}
      <Toast toast={toast} onDone={clearToast} />
    </div>
  );
}
