import Panel from './Panel';
import BlockTitle from './BlockTitle';
import ProjectSlider from './ProjectSlider';

/** Projects: "What I can build for you" columns, then "Things I've built" (filters + slider) when there are projects. */
export default function ProjectsPanel({ settings, build, projects, filters }) {
  const head = settings.section_headers.projects;
  return (
    <Panel id="projects" head={head}>

      {build.length > 0 && (
        <>
          <BlockTitle>{settings.block_titles.build}</BlockTitle>
          <div className="build-grid">
            {build.map((b) => (
              <div className="build-item" key={b.id}>
                {b.icon && <i className={b.icon} aria-hidden="true"></i>}
                <h3>{b.title}</h3>
                {b.description && <p>{b.description}</p>}
              </div>
            ))}
          </div>
        </>
      )}
      {settings.build_more_text && (
        <div className="build-more">
          <p>{settings.build_more_text}</p>
          <a className="btn btn-line" href="#contact" data-s="contact">
            Ask me about it
          </a>
        </div>
      )}

      {projects.length > 0 && (
        <>
          <BlockTitle>{settings.block_titles.built}</BlockTitle>
          <ProjectSlider projects={projects} filters={filters} />
        </>
      )}
    </Panel>
  );
}
