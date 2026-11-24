'use client';

import { useEffect } from 'react';

/** Small message at the bottom of the screen. `toast` = { text, error } or null. Success hides after 2.5s, errors after 5s. */
export default function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, toast.error ? 5000 : 2500);
    return () => clearTimeout(t);
  }, [toast, onDone]);
  if (!toast) return null;
  return (
    <div className={`toast${toast.error ? ' error' : ''}`} role={toast.error ? 'alert' : 'status'}>
      {toast.text}
    </div>
  );
}
