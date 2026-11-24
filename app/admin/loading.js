/**
 * Shown while a dashboard page loads its data. Every admin page reads the login session,
 * which can only happen at request time, so Next.js needs this loading boundary around it.
 */
export default function Loading() {
  return (
    <div className="adm-loading" role="status">
      <span className="adm-spinner" aria-hidden="true" />
      Loading…
    </div>
  );
}
