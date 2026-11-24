import SectionHead from './SectionHead';
import BlockTitle from './BlockTitle';

/** Contact: Email / WhatsApp / Telegram boxes, then social media cards (whole card is a link), then the copyright line. */
export default function ContactPanel({ settings, contacts }) {
  const head = settings.section_headers.contact;
  return (
    <section className="panel" id="p-contact" aria-labelledby="t-contact">
      <SectionHead id="t-contact" label={head.label} heading={head.heading} />

      {contacts.contact.length > 0 && (
        <div className="contact">
          {contacts.contact.map((c) => (
            <div className="cbox" key={c.id}>
              <div className="ic">{c.icon && <i className={c.icon} aria-hidden="true"></i>}</div>
              <div>
                <h3>{c.platform}</h3>
                <a href={c.url} target={c.url.startsWith('http') ? '_blank' : undefined} rel="noopener">
                  {c.label || c.url}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {contacts.social.length > 0 && (
        <>
          <BlockTitle>{settings.block_titles.social}</BlockTitle>
          <div className="contact social">
            {contacts.social.map((c) => (
              <a className="cbox" key={c.id} href={c.url} target="_blank" rel="noopener">
                <div className="ic">{c.icon && <i className={c.icon} aria-hidden="true"></i>}</div>
                <div>
                  <h3>{c.platform}</h3>
                  <span className="handle">{c.label || c.url}</span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      {settings.copyright_text && <p className="copy">{settings.copyright_text}</p>}
    </section>
  );
}
