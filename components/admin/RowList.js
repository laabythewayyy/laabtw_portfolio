'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ADMIN_SECTIONS } from '@/lib/admin/schema';
import { moveRowAction, setVisibleAction } from '@/app/admin/actions';
import Drawer from './Drawer';
import Toast from './Toast';

const SAVED = 'Changes saved. Your site is updated.';

function Row({ section, row, first, last, onEdit, busy, run }) {
  const def = ADMIN_SECTIONS[section];
  const img = def.rowImage?.(row);
  const icon = def.rowIcon?.(row);
  return (
    <div className={`row${row.is_visible ? '' : ' hidden'}`}>
      <div className="row-move">
        <button type="button" aria-label="Move up" disabled={first || busy} onClick={() => run(() => moveRowAction(section, row.id, 'up'))}>▲</button>
        <button type="button" aria-label="Move down" disabled={last || busy} onClick={() => run(() => moveRowAction(section, row.id, 'down'))}>▼</button>
      </div>
      <div className="row-thumb" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- uploaded image */}
        {img ? <img src={img} alt="" /> : icon ? <i className={icon} /> : null}
      </div>
      <div>
        <div className="row-title">{def.rowTitle(row)}</div>
        {def.rowMeta && <div className="row-meta">{def.rowMeta(row)}</div>}
      </div>
      <button type="button" className={`toggle${row.is_visible ? ' on' : ''}`} disabled={busy}
        aria-pressed={row.is_visible} onClick={() => run(() => setVisibleAction(section, row.id, !row.is_visible))}>
        <i aria-hidden="true" />
        <span>{row.is_visible ? 'Visible' : 'Hidden'}</span>
      </button>
      <button type="button" className="edit-btn" onClick={() => onEdit(row)}>Edit</button>
    </div>
  );
}

/** A section's rows (grouped when the schema says so), with move/hide/edit, plus the add/edit drawer. */
export default function RowList({ section, rows, categories, headingLevel = 'page' }) {
  const def = ADMIN_SECTIONS[section];
  const router = useRouter();
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new row, object = edit
  const [toast, setToast] = useState('');
  const [busy, startTransition] = useTransition();

  const run = (fn) => startTransition(async () => { await fn(); router.refresh(); setToast(SAVED); });
  const close = useCallback(() => setEditing(undefined), []);
  const saved = useCallback((msg) => { setEditing(undefined); router.refresh(); setToast(typeof msg === 'string' ? msg : SAVED); }, [router]);
  const clearToast = useCallback(() => setToast(''), []);

  const groups = def.groupBy
    ? def.groups.map((g) => ({ ...g, rows: rows.filter((r) => r[def.groupBy] === g.value) }))
    : [{ value: 'all', label: null, rows }];

  return (
    <>
      <div className="adm-head">
        <div>
          {headingLevel === 'page' ? <h1>{def.title}</h1> : <h2 className="group-title" style={{ margin: 0 }}>{def.title}</h2>}
          {def.intro && <p className="adm-sub">{def.intro}</p>}
        </div>
        <button type="button" className="btn btn-red" onClick={() => setEditing(null)}>{def.addLabel}</button>
      </div>

      {rows.length === 0 ? (
        <p className="empty">{def.emptyText || `Nothing here yet. Click "${def.addLabel}" to add one to your site.`}</p>
      ) : (
        groups.map((g) =>
          g.rows.length === 0 ? null : (
            <section key={g.value}>
              {g.label && <h3 className="group-title">{g.label}</h3>}
              <div className="rows">
                {g.rows.map((r, i) => (
                  <Row key={r.id} section={section} row={r} first={i === 0} last={i === g.rows.length - 1}
                    onEdit={setEditing} busy={busy} run={run} />
                ))}
              </div>
            </section>
          ),
        )
      )}

      {editing !== undefined && (
        <Drawer section={section} row={editing} categories={categories} onClose={close} onSaved={saved} />
      )}
      <Toast message={toast} onDone={clearToast} />
    </>
  );
}
