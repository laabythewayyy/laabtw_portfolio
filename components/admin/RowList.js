'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Sortable from 'sortablejs';
import { ADMIN_SECTIONS } from '@/lib/admin/schema';
import { ORDER_SAVED, SAVED } from '@/lib/admin/messages';
import { reorderAction, setVisibleAction } from '@/app/admin/actions';
import { useAdminAction } from './useAdminAction';
import Editor from './Editor';
import Toast from './Toast';
import Toggle from './Toggle';

function Thumb({ def, row }) {
  const img = def.rowImage?.(row);
  // eslint-disable-next-line @next/next/no-img-element -- uploaded image
  if (img) return <div className="thumb"><img src={img} alt="" loading="lazy" /></div>;
  return <div className="thumb"><i className={def.rowIcon?.(row) || def.icon} aria-hidden="true" /></div>;
}

function Row({ def, row, open, onToggleOpen, onVisible, busy, editor }) {
  const meta = def.rowMeta?.(row);
  const bar = def.rowBar?.(row);
  return (
    <div data-id={row.id} className={`item${row.is_visible ? '' : ' hidden'}${open ? ' open' : ''}`}>
      <div className="row">
        <div className="handle" title="Drag to reorder" aria-label="Drag to reorder">
          <i className="fa-solid fa-grip-vertical" aria-hidden="true" />
        </div>
        <Thumb def={def} row={row} />
        <div className="row-text">
          <div className="title">
            {def.rowTitle(row)}
            {bar != null && meta && <span className="meta"> · {meta}</span>}
          </div>
          {bar != null ? (
            <div className="mini-bar"><i style={{ width: `${bar}%` }} /></div>
          ) : (
            meta && <div className="meta">{meta}</div>
          )}
        </div>
        <Toggle on={row.is_visible} disabled={busy} onLabel="Visible" offLabel="Hidden" onClick={onVisible} />
        <button type="button" className="edit" onClick={onToggleOpen} aria-expanded={open}>Edit</button>
      </div>
      {open && editor}
    </div>
  );
}

/** One group of rows that can be reordered by dragging the handle. */
function Group({ rows, onReorder, children }) {
  const box = useRef(null);

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

  return <div className="rows" ref={box}>{rows.map(children)}</div>;
}

/** A section's rows (grouped when the schema says so) with drag-to-reorder, visibility switch and inline editors. */
export default function RowList({ section, rows, categories }) {
  const def = ADMIN_SECTIONS[section];
  const { run, busy, toast, notify, clearToast } = useAdminAction();
  const [openId, setOpenId] = useState(null); // a row id, 'new', or null

  // a dragged order is shown immediately, until the server's fresh list (with the same ids) arrives
  const signature = rows.map((r) => `${r.id}:${r.sort_order}`).join(',');
  const [dragged, setDragged] = useState({ signature: '', ids: [] });
  const ordered = dragged.signature === signature
    ? [...rows].sort((a, b) => dragged.ids.indexOf(a.id) - dragged.ids.indexOf(b.id))
    : rows;

  const onSaved = useCallback((msg) => { setOpenId(null); notify(typeof msg === 'string' ? msg : SAVED); }, [notify]);

  const onReorder = useCallback((groupIds) => {
    setDragged((d) => {
      const base = d.signature === signature ? d.ids : rows.map((r) => r.id);
      const inGroup = new Set(groupIds);
      const queue = [...groupIds];
      return { signature, ids: base.map((id) => (inGroup.has(id) ? queue.shift() : id)) };
    });
    // if saving fails, drop the optimistic order so the list shows what is really saved
    run(() => reorderAction(section, groupIds), ORDER_SAVED, () => setDragged({ signature: '', ids: [] }));
  }, [rows, signature, section, run]);

  const groups = def.groupBy
    ? def.groups.map((g) => ({ ...g, rows: ordered.filter((r) => r[def.groupBy] === g.value) }))
    : [{ value: 'all', label: null, rows: ordered }];

  const editorFor = (row) => (
    <Editor section={section} row={row} categories={categories} onClose={() => setOpenId(null)} onSaved={onSaved} />
  );

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
          {editorFor(null)}
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
                <Group rows={g.rows} onReorder={onReorder}>
                  {(r) => (
                    <Row key={r.id} def={def} row={r} busy={busy} open={openId === r.id}
                      onToggleOpen={() => setOpenId(openId === r.id ? null : r.id)}
                      onVisible={() => run(() => setVisibleAction(section, r.id, !r.is_visible), r.is_visible ? 'Hidden from your site.' : 'Shown on your site.')}
                      editor={editorFor(r)} />
                  )}
                </Group>
              </section>
            ),
          )}
        </>
      )}
      <Toast toast={toast} onDone={clearToast} />
    </>
  );
}
