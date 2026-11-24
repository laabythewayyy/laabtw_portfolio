/**
 * One section panel (About, Resume, Projects, Contact): the panel box plus its header,
 * a small grey label with a red line and the big uppercase heading.
 * `id` is the section id; the panel gets id "p-<id>" (Portfolio and Lightning look it up by that).
 */
export default function Panel({ id, head, children }) {
  return (
    <section className="panel" id={`p-${id}`} aria-labelledby={`t-${id}`}>
      <div className="sec-head">
        <p className="sec-label">{head.label}</p>
        <h2 id={`t-${id}`}>{head.heading}</h2>
      </div>
      {children}
    </section>
  );
}
