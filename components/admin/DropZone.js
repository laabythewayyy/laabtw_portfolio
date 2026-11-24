'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Upload box: drag a file onto it or click to choose. Shows the new image (or file name) straight away.
 * The file is sent with the form under `fileName`; the current URL under `urlName`; a "remove" checkbox under `removeName`.
 */
export default function DropZone({ fileName, urlName, removeName, current, kind = 'image', title, hint, onChange }) {
  const input = useRef(null);
  const [preview, setPreview] = useState(kind === 'image' ? current || '' : '');
  const [name, setName] = useState('');
  const [over, setOver] = useState(false);
  const accept = kind === 'pdf' ? 'application/pdf' : 'image/jpeg,image/png,image/webp';

  // free the in-memory preview when it is replaced or the box closes
  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  function take(file) {
    if (!file) return;
    if (kind === 'image') setPreview(URL.createObjectURL(file));
    setName(file.name);
    onChange?.();
  }

  return (
    <div>
      <label className={`drop${over ? ' over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const f = e.dataTransfer.files?.[0];
          if (!f) return;
          const dt = new DataTransfer();
          dt.items.add(f);
          input.current.files = dt.files; // so the dropped file is submitted with the form
          take(f);
        }}>
        {kind === 'image' && preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local/uploaded preview
          <img src={preview} alt="" />
        ) : (
          <span className="dicon"><i className={kind === 'pdf' ? 'fa-regular fa-file-pdf' : 'fa-regular fa-image'} aria-hidden="true" /></span>
        )}
        <input ref={input} type="file" name={fileName} accept={accept} onChange={(e) => take(e.target.files?.[0])} />
        <div>
          <b>{name || title || 'Drop a file here, or click to choose'}</b>
          <span className="hint">{hint || (kind === 'pdf' ? 'PDF, up to 5 MB.' : 'JPG, PNG or WebP, up to 5 MB.')}</span>
        </div>
      </label>
      {urlName && <input type="hidden" name={urlName} value={current ?? ''} />}
      {current && removeName && (
        <label className="check">
          <input type="checkbox" name={removeName} onChange={() => onChange?.()} /> <span>{kind === 'pdf' ? 'Use the default CV instead' : 'Remove this image'}</span>
        </label>
      )}
    </div>
  );
}
