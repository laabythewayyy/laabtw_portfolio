/** Small grey label with a red line, then the big uppercase heading (like the reference). */
export default function SectionHead({ id, label, heading }) {
  return (
    <div className="sec-head">
      <p className="sec-label">{label}</p>
      <h2 id={id}>{heading}</h2>
    </div>
  );
}
