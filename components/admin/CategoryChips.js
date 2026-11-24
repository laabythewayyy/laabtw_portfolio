'use client';

import { useCallback, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteRowAction, saveRowAction } from '@/app/admin/actions';
import Toast from './Toast';

/** Project categories as chips: ✕ removes one (its projects stay, uncategorised), the box adds a new one. */
export default function CategoryChips({ categories }) {
  const router = useRouter();
  const input = useRef(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [busy, startTransition] = useTransition();
  const clearToast = useCallback(() => setToast(''), []);

  function add(e) {
    e.preventDefault();
    const name = input.current.value.trim();
    if (!name) return;
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) { setError('That category already exists.'); return; }
    setError('');
    const fd = new FormData();
    fd.set('name', name);
    startTransition(async () => {
      const r = await saveRowAction('categories', null, {}, fd);
      if (!r.ok) { setError(r.errors?.name || r.error); return; }
      input.current.value = '';
      router.refresh();
      setToast('Category added.');
    });
  }

  function remove(c) {
    if (!confirm(`Remove the category "${c.name}"? Its projects stay, without a category.`)) return;
    startTransition(async () => { await deleteRowAction('categories', c.id); router.refresh(); setToast('Category removed.'); });
  }

  return (
    <div className="card cats">
      <h2>Categories</h2>
      <p className="hint">These become the filter buttons on your site. Removing one keeps its projects.</p>
      <div className="chips">
        {categories.map((c) => (
          <span className="chip" key={c.id}>
            {c.name}
            <button type="button" aria-label={`Remove ${c.name}`} disabled={busy} onClick={() => remove(c)}><i className="fa-solid fa-xmark" aria-hidden="true" /></button>
          </span>
        ))}
        <form className="chip-add" onSubmit={add}>
          <input ref={input} placeholder="New category" aria-label="New category" />
          <button className="btn btn-line btn-sm" disabled={busy}>Add</button>
        </form>
      </div>
      {error && <span className="field-error">{error}</span>}
      <Toast message={toast} onDone={clearToast} />
    </div>
  );
}
