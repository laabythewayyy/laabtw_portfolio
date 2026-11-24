import Panel from './Panel';
import BlockTitle from './BlockTitle';
import ContactCard from './ContactCard';

/** Contact: Email / WhatsApp / Telegram boxes, then social media cards (whole card is a link), then the copyright line. */
export default function ContactPanel({ settings, contacts }) {
  const head = settings.section_headers.contact;
  return (
    <Panel id="contact" head={head}>

      {contacts.contact.length > 0 && (
        <div className="contact">
          {contacts.contact.map((c) => (
            <ContactCard key={c.id} contact={c} />
          ))}
        </div>
      )}

      {contacts.social.length > 0 && (
        <>
          <BlockTitle>{settings.block_titles.social}</BlockTitle>
          <div className="contact social">
            {contacts.social.map((c) => (
              <ContactCard key={c.id} contact={c} whole />
            ))}
          </div>
        </>
      )}

      {settings.copyright_text && <p className="copy">{settings.copyright_text}</p>}
    </Panel>
  );
}
