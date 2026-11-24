import SectionHead from './SectionHead';

function Group({ title, entries }) {
  if (entries.length === 0) return null;
  return (
    <>
      <h4>{title}</h4>
      <div className="tl">
        {entries.map((e) => (
          <div className="tl-item" key={e.id}>
            <h5>{e.title}</h5>
            {e.date_label && <span className="date">{e.date_label}</span>}
            {e.place && <p className="org">{e.place}</p>}
            {e.description && <p>{e.description}</p>}
            {e.bullets?.length > 0 && (
              <ul>
                {e.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/** Resume: Education + Work experience on the left, Achievements on the right. Empty groups are hidden. */
export default function ResumePanel({ settings, resume, resumeEmpty }) {
  const head = settings.section_headers.resume;
  const left = resume.education.length + resume.work.length > 0;
  return (
    <section className="panel" id="p-resume" aria-labelledby="t-resume">
      <SectionHead id="t-resume" label={head.label} heading={head.heading} />
      {resumeEmpty ? (
        <p className="resume-empty">Resume coming soon.</p>
      ) : (
        <div className="resume">
          {left && (
            <div>
              <Group title="Education" entries={resume.education} />
              <Group title="Work experience" entries={resume.work} />
            </div>
          )}
          {resume.achievement.length > 0 && (
            <div>
              <Group title="Achievements" entries={resume.achievement} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
