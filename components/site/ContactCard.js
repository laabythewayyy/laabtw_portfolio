const opensNewTab = (url) => /^https?:/i.test(url);

/**
 * One contact box: icon, platform name, then the handle.
 * `whole`: the whole card is the link (social cards); otherwise only the handle is a link (contact boxes).
 */
export default function ContactCard({ contact: c, whole = false }) {
  const text = c.label || c.url;
  const icon = <div className="ic">{c.icon && <i className={c.icon} aria-hidden="true"></i>}</div>;
  const link = { href: c.url, ...(opensNewTab(c.url) ? { target: '_blank', rel: 'noopener' } : {}) };

  if (whole) {
    return (
      <a className="cbox" {...link}>
        {icon}
        <div>
          <h3>{c.platform}</h3>
          <span className="handle">{text}</span>
        </div>
      </a>
    );
  }
  return (
    <div className="cbox">
      {icon}
      <div>
        <h3>{c.platform}</h3>
        <a {...link}>{text}</a>
      </div>
    </div>
  );
}
