import RichText from './RichText';
import { SECTIONS } from './sections';

/** Left side of the homepage. When a section opens, CSS turns this into the top bar. */
export default function Intro({ settings, cvUrl, heroLinks }) {
  return (
    <section className="intro" aria-label="Introduction">
      <h1>
        {settings.first_name} <span className="surname">{settings.last_name}</span>
      </h1>
      <RichText className="lead" text={settings.role_line} />
      <nav aria-label="Main">
        <ul className="menu">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} data-s={s.id} className={s.id === 'home' ? 'active' : undefined}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="cta">
        <a className="btn btn-red" href="#projects" data-s="projects">
          View my projects
        </a>
        <a className="btn btn-line" href={cvUrl} target="_blank" rel="noopener">
          <i className="fa-regular fa-file-lines" aria-hidden="true"></i>Download CV
        </a>
      </div>
      {heroLinks.length > 0 && (
        <div className="socials">
          {heroLinks.map((l) => (
            <a key={l.id} href={l.url} target="_blank" rel="noopener" aria-label={l.platform}>
              <i className={l.icon} aria-hidden="true"></i>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
