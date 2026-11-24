import SectionHead from './SectionHead';
import BlockTitle from './BlockTitle';
import RichText from './RichText';

/** About: avatar card, title, text, info list, CV button, then the skill bars (they fill when the section opens). */
export default function AboutPanel({ settings, avatarUrl, cvUrl, skills }) {
  const head = settings.section_headers.about;
  return (
    <section className="panel" id="p-about" aria-labelledby="t-about">
      <SectionHead id="t-about" label={head.label} heading={head.heading} />
      <div className="about">
        <div className="pic">
          {/* eslint-disable-next-line @next/next/no-img-element -- avatar may be an uploaded Supabase URL */}
          <img src={avatarUrl} alt={`${settings.first_name} ${settings.last_name}'s avatar`} />
        </div>
        <div>
          {settings.about_title && <h3>{settings.about_title}</h3>}
          {settings.about_body && <RichText text={settings.about_body} />}
          {settings.about_facts.length > 0 && (
            <ul className="facts">
              {settings.about_facts.map((f, i) => (
                <li key={i}>
                  <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                  <b>{f.label}:</b>
                  <span>{f.value}</span>
                </li>
              ))}
            </ul>
          )}
          {settings.about_body_2 && <RichText text={settings.about_body_2} />}
          <div className="cta" style={{ marginTop: 26 }}>
            <a className="btn btn-red" href={cvUrl} target="_blank" rel="noopener">
              <i className="fa-regular fa-file-lines" aria-hidden="true"></i>Download CV
            </a>
          </div>
        </div>
      </div>

      {skills.length > 0 && (
        <>
          <BlockTitle>{settings.block_titles.skills}</BlockTitle>
          <div className="skills" style={{ '--rows': Math.ceil(skills.length / 2) }}>
            {skills.map((s) => (
              <div className="bar" key={s.id}>
                <div className="top">
                  {s.name}
                  <span>{s.percent}%</span>
                </div>
                <div className="track" role="img" aria-label={`${s.name} ${s.percent}%`}>
                  <i style={{ '--v': `${s.percent}%` }}></i>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
