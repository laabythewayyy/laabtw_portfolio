/** "Download CV" button (homepage and About). */
export default function CvButton({ href, variant = 'line' }) {
  return (
    <a className={`btn btn-${variant}`} href={href} target="_blank" rel="noopener">
      <i className="fa-regular fa-file-lines" aria-hidden="true"></i>Download CV
    </a>
  );
}
