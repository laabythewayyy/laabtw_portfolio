'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Sortable from 'sortablejs';
import { ADMIN_SECTIONS } from '@/lib/admin/schema';
import { reorderAction, setVisibleAction } from '@/app/admin/actions';
import Editor from './Editor';
import Toast from './Toast';

const SAVED = 'Changes saved. Your site is updated.';
const KIND_ICON = { education: 'fa-solid fa-graduation-cap', work: 'fa-solid fa-briefcase', achievement: 'fa-solid fa-trophy' };

function Thumb({ section, row }) {
  const def = ADMIN_SECTIONS[section];
  const img = def.rowImage?.(row);
  // eslint-disable-next-line @next/next/no-img-element -- uploaded image
  if (img) return <div className="thumb"><img src={img} alt="" /></div>;
  const icon = def.rowIcon?.(row) || KIND_ICON[row.kind] || (section === 'skills' ? 'fa-solid fa-chart-simple' : section === 'projects' ? 'fa-regular fa-image' : 'fa-solid fa-tag');
  return <div className="thumb"><i className={icon} aria-hidden="true" /></div>;
}

/** One group of rows that can be reordered by dragging the ⠿ handle. */
function Group({ section, rows, openId, setOpenId, categories, onSaved, onReorder, run, busy }) {
  const box = useRef(null);
  const def = ADMIN_SECTIONS[section];

  useEffect(() => {
    const s = Sortable.create(box.current, {
      handle: '.handle',
      animation: 200,
      easing: 'cubic-bezier(.2,.8,.2,1)',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onEnd(evt) {
        if (evt.oldIndex === evt.newIndex) return;
        const ids = [...box.current.children].map((el) => el.dataset.id);
        // put the DOM back the way React rendered it; React re-renders in the new order
        evt.item.remove();
        box.current.insertBefore(evt.item, box.current.children[evt.oldIndex] ?? null);
        onReorder(ids);
      },
    });
    return () => s.destroy();
  }, [onReorder]);

  return (
    <div className="rows" ref={box}>
      {rows.map((r) => {
        const open = openId === r.id;
        return (
          <div key={r.id} data-id={r.id} className={`item${r.is_visible ? '' : ' hidden'}${open ? ' open' : ''}`}>
            <div className="row">
              <div className="handle" title="Drag to reorder" aria-label="Drag to reorder"><i className="fa-solid fa-grip-vertical" aria-hidden="true" /></div>
              <Thumb section={section} row={r} />
              <div className="row-text">
                <div className="title">
                  {def.rowTitle(r)}
                  {section === 'skills' && <span className="meta"> · {r.percent}%</span>}
                </div>
                {section === 'skills' ? (
                  <div className="mini-bar"><i style={{ width: `${r.percent}%` }} /></div>
                ) : (
                  def.rowMeta?.(r) && <div className="meta">{def.rowMeta(r)}</div>
                )}
              </div>
              <button type="button" className={`toggle${r.is_visible ? ' on' : ''}`} disabled={busy} aria-pressed={r.is_visible}
                onClick={() => run(() => setVisibleAction(section, r.id, !r.is_visible), r.is_visible ? 'Hidden from your site.' : 'Shown on your site.')}>
                <i aria-hidden="true" />
                <span>{r.is_visible ? 'Visible' : 'Hidden'}</span>
              </button>
              <button type="button" className="edit" onClick={() => setOpenId(open ? null : r.id)} aria-expanded={open}>Edit</button>
            </div>
            {open && (
              <Editor section={section} row={r} categories={categories} onClose={() => setOpenId(null)} onSaved={onSaved} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** A section's rows (grouped when the schema says so) with drag-to-reorder, visibility switch and inline editors. */
export default function RowList({ section, rows, categories }) {
  const def = ADMIN_SECTIONS[section];
  const router = useRouter();
  const [openId, setOpenId] = useState(null); // a row id, 'new', or null
  const [toast, setToast] = useState('');
  const [busy, startTransition] = useTransition();
  // a dragged order is shown immediately, until the server's fresh list (with the same ids) arrives
  const signature = rows.map((r) => `${r.id}:${r.sort_order}`).join(',');
  const [dragged, setDragged] = useState({ signature: '', ids: [] });
  const ordered = dragged.signature === signature
    ? [...rows].sort((a, b) => dragged.ids.indexOf(a.id) - dragged.ids.indexOf(b.id))
    : rows;

  const run = (fn, msg = SAVED) => startTransition(async () => { await fn(); router.refresh(); setToast(msg); });
  const onSaved = useCallback((msg) => { setOpenId(null); router.refresh(); setToast(typeof msg === 'string' ? msg : SAVED); }, [router]);
  const clearToast = useCallback(() => setToast(''), []);

  const onReorder = useCallback((groupIds) => {
    setDragged((d) => {
      const base = d.signature === signature ? d.ids : rows.map((r) => r.id);
      const set = new Set(groupIds);
      const queue = [...groupIds];
      return { signature, ids: base.map((id) => (set.has(id) ? queue.shift() : id)) };
    });
    startTransition(async () => { await reorderAction(section, groupIds); router.refresh(); setToast('Order saved. Your site is updated.'); });
  }, [rows, signature, section, router]);

  const groups = def.groupBy
    ? def.groups.map((g) => ({ ...g, rows: ordered.filter((r) => r[def.groupBy] === g.value) }))
    : [{ value: 'all', label: null, rows: ordered }];

  return (
    <>
      <div className="head">
        <div>
          <h1>{def.title}</h1>
          {def.intro && <p className="sub">{def.intro}</p>}
        </div>
        <button type="button" className="btn btn-red" onClick={() => setOpenId('new')}>{def.addLabel}</button>
      </div>

      {openId === 'new' && (
        <div className="item open new-item">
          <div className="row"><div className="title">{def.addLabel}</div></div>
          <Editor section={section} row={null} categories={categories} onClose={() => setOpenId(null)} onSaved={onSaved} />
        </div>
      )}

      {rows.length === 0 ? (
        openId !== 'new' && <p className="empty">{def.emptyText || `Nothing here yet. Click "${def.addLabel}" to add one to your site.`}</p>
      ) : (
        <>
          <p className="drag-hint"><i className="fa-solid fa-grip-vertical" aria-hidden="true" /> Drag a row to change the order on your site.</p>
          {groups.map((g) =>
            g.rows.length === 0 ? null : (
              <section key={g.value}>
                {g.label && <h3 className="group-title">{g.label}</h3>}
                <Group section={section} rows={g.rows} openId={openId} setOpenId={setOpenId} categories={categories}
                  onSaved={onSaved} onReorder={onReorder} run={run} busy={busy} />
              </section>
            ),
          )}
        </>
      )}
      <Toast message={toast} onDone={clearToast} />
    </>
  );
}
