'use client';

import { useEffect, useRef, useState } from 'react';
import { MAX_UPLOAD_BYTES, shrinkImage } from '@/lib/image';

/**
 * Upload box: drag a file onto it or click to choose. Shows the new image (or file name) straight away.
 * Pictures are made smaller in the browser first; a file still over 4 MB is refused here with a message
 * (the server would reject it anyway).
 * The file is sent with the form under `fileName`; the current URL under `urlName`; a "remove" checkbox under `removeName`.
 * Optional: onFile(previewUrl, fileName) when a file is chosen, onRemove(checked) when the remove box changes.
 */
export default function DropZone({ fileName, urlName, removeName, removeLabel, current, kind = 'image', title, hint, onChange, onFile, onRemove }) {
  const input = useRef(null);
  const [preview, setPreview] = useState(kind === 'image' ? current || '' : '');
  const [name, setName] = useState('');
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');
  const accept = kind === 'pdf' ? 'application/pdf' : 'image/jpeg,image/png,image/webp';

  // free the in-memory preview when it is replaced or the box closes
  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  // put a file into the real <input>, so it is the one sent with the form
  function setInputFile(file) {
    const dt = new DataTransfer();
    if (file) dt.items.add(file);
    input.current.files = dt.files;
  }

  async function take(picked) {
    if (!picked) return;
    setProblem('');
    setBusy(true);
    const file = kind === 'image' ? await shrinkImage(picked) : picked;
    setBusy(false);
    if (file.size > MAX_UPLOAD_BYTES) {
      setInputFile(null);
      setName('');
      setProblem(`That file is ${(file.size / 1048576).toFixed(1)} MB. Please choose one under 4 MB.`);
      return;
    }
    setInputFile(file);
    const url = kind === 'image' ? URL.createObjectURL(file) : '';
    if (url) setPreview(url);
    setName(file.name);
    onFile?.(url, file.name);
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
          if (f) take(f);
        }}>
        {kind === 'image' && preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local/uploaded preview
          <img src={preview} alt="" />
        ) : (
          <span className="dicon"><i className={kind === 'pdf' ? 'fa-regular fa-file-pdf' : 'fa-regular fa-image'} aria-hidden="true" /></span>
        )}
        <input ref={input} type="file" name={fileName} accept={accept} onChange={(e) => take(e.target.files?.[0])} />
        <div>
          <b>{busy ? 'Preparing the picture…' : name || title || 'Drop a file here, or click to choose'}</b>
          <span className="hint">{hint || (kind === 'pdf' ? 'PDF, up to 4 MB.' : 'JPG, PNG or WebP. Large photos are made smaller automatically.')}</span>
        </div>
      </label>
      {problem && <span className="field-error" role="alert">{problem}</span>}
      {urlName && <input type="hidden" name={urlName} value={current ?? ''} />}
      {current && removeName && (
        <label className="check">
          <input type="checkbox" name={removeName} onChange={(e) => { onRemove?.(e.target.checked); onChange?.(); }} /> <span>{removeLabel || (kind === 'pdf' ? 'Use the default CV instead' : 'Remove this image')}</span>
        </label>
      )}
    </div>
  );
}
