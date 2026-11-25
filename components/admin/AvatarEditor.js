'use client';

import { useState } from 'react';
import { avatarFrame } from '@/lib/content';
import AvatarCircle from '@/components/site/AvatarCircle';
import DropZone from './DropZone';

const ORIGINAL = '/avatartola.png';

/**
 * Homepage avatar: upload box + live circle preview + Zoom and Up/Down sliders.
 * The sliders start on "Automatic" (empty hidden inputs) and go back to it whenever the picture changes,
 * so a setting made for one picture never carries over to another.
 */
export default function AvatarEditor({ current, zoom: savedZoom, y: savedY, error, onDirty }) {
  const [pic, setPic] = useState({ src: current || ORIGINAL, name: current || ORIGINAL });
  const [zoom, setZoom] = useState(savedZoom ?? null); // null = automatic
  const [y, setY] = useState(savedY ?? null);
  const shown = avatarFrame(pic.name, zoom, y); // what the circle shows right now
  const auto = zoom === null && y === null;

  const resetFraming = () => { setZoom(null); setY(null); };
  const change = (fn) => (e) => { fn(Number(e.target.value)); onDirty(); };

  return (
    <div className="avatar-editor">
      <div className="avatar-preview">
        <AvatarCircle src={pic.src} name={pic.name} zoom={shown.zoom} y={shown.y} />
        <span className="hint">Live preview</span>
      </div>

      <div className="avatar-controls">
        <DropZone fileName="avatar__file" removeName="avatar_url__remove" current={current} kind="image" onChange={onDirty}
          removeLabel="Use the original cartoon avatar instead"
          title={current ? 'Drop a new image here, or click to choose' : 'Using the original cartoon avatar. Drop an image here to replace it'}
          hint="A cut-out PNG/WebP (transparent background) works best. JPG photos are framed around the face. Large photos are made smaller automatically."
          onFile={(url, name) => { setPic({ src: url, name }); resetFraming(); }}
          onRemove={(checked) => { setPic(checked ? { src: ORIGINAL, name: ORIGINAL } : { src: current || ORIGINAL, name: current || ORIGINAL }); resetFraming(); }} />
        {error && <span className="field-error">{error}</span>}

        <input type="hidden" name="avatar_zoom" value={zoom ?? ''} />
        <input type="hidden" name="avatar_y" value={y ?? ''} />

        <label className="f">
          <span>Zoom</span>
          <div className="slider-row">
            <input type="range" min="0.5" max="2.5" step="0.01" value={shown.zoom} onChange={change(setZoom)} aria-label="Zoom" />
            <span className="pct">{Math.round(shown.zoom * 100)}%</span>
          </div>
        </label>
        <label className="f">
          <span>Up / down</span>
          <div className="slider-row">
            <input type="range" min="-50" max="50" step="1" value={shown.y} onChange={change(setY)} aria-label="Move up or down" />
            <span className="pct">{shown.y > 0 ? `+${shown.y}` : shown.y}</span>
          </div>
        </label>
        <div className="avatar-auto">
          <span className="hint">{auto ? 'Automatic framing for this kind of picture.' : 'Your own framing. Saved with the avatar.'}</span>
          <button type="button" className="btn btn-line btn-sm" disabled={auto} onClick={() => { resetFraming(); onDirty(); }}>
            Reset to automatic
          </button>
        </div>
      </div>
    </div>
  );
}
