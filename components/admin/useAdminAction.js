'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SAVE_FAILED } from '@/lib/admin/messages';

/**
 * Runs a dashboard server action, then refreshes the page and shows a toast.
 * Actions return { ok: false, error } on failure: the toast then shows the error and `onFail` runs.
 * → { run(action, okMessage, onFail?), busy, toast, notify(text, isError?), clearToast }
 */
export function useAdminAction() {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [toast, setToast] = useState(null); // { text, error } or null

  const notify = useCallback((text, error = false) => setToast({ text, error }), []);
  const clearToast = useCallback(() => setToast(null), []);

  const run = useCallback(
    (action, okMessage, onFail) =>
      startTransition(async () => {
        let result;
        try {
          result = await action();
        } catch {
          result = { ok: false };
        }
        if (result?.ok === false) {
          onFail?.();
          notify(result.error || SAVE_FAILED, true);
          return;
        }
        router.refresh();
        notify(okMessage);
      }),
    [router, notify],
  );

  return { run, busy, toast, notify, clearToast };
}
