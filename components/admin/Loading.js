/**
 * Shown while a dashboard page loads its data. Every admin page reads the login session,
 * which can only happen at request time, so each page wraps its data part in <Suspense fallback={<Loading />}>.
 */
export default function Loading() {
  return (
    <div className="adm-loading" role="status">
      <span className="adm-spinner" aria-hidden="true" />
      Loading…
    </div>
  );
}
