'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

/** Shown inside the dashboard (sidebar stays) if a page or a save fails unexpectedly, instead of a blank error screen. */
export default function AdminError({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="card adm-error" role="alert">
      <h2>Something went wrong</h2>
      <p className="hint">
        Your change may not have been saved. Check your connection and try again. If you were uploading a file, try a
        smaller one (under 4 MB).
      </p>
      <div className="actions">
        <button type="button" className="btn btn-red" onClick={() => retry()}>Try again</button>
        <Link className="btn btn-line" href="/admin">Back to overview</Link>
      </div>
    </div>
  );
}
