import { getSiteContent } from '@/lib/site-content';
import Portfolio from '@/components/site/Portfolio';
import Intro from '@/components/site/Intro';
import HeroArt from '@/components/site/HeroArt';
import SectionHead from '@/components/site/SectionHead';
import PhoneMenu from '@/components/site/PhoneMenu';
import Cursor from '@/components/site/Cursor';
import Lightning from '@/components/site/Lightning';
import AboutPanel from '@/components/site/AboutPanel';
import ResumePanel from '@/components/site/ResumePanel';

export async function generateMetadata() {
  const { settings } = await getSiteContent();
  return { title: settings.site_title };
}

export default async function Home() {
  const content = await getSiteContent();
  const { settings } = content;
  const head = (key) => (
    <SectionHead id={`t-${key}`} label={settings.section_headers[key].label} heading={settings.section_headers[key].heading} />
  );

  return (
    <>
      <Portfolio>
        <div className="home">
          <Intro settings={settings} cvUrl={content.cvUrl} heroLinks={content.contacts.hero} />
          <HeroArt avatarUrl={content.avatarUrl} openToWork={settings.open_to_work} />
        </div>
        {/* Section panels: filled in Tasks 5–7 */}
        <AboutPanel settings={settings} avatarUrl={content.avatarUrl} cvUrl={content.cvUrl} skills={content.skills} />
        <ResumePanel settings={settings} resume={content.resume} resumeEmpty={content.resumeEmpty} />
        <section className="panel" id="p-projects" aria-labelledby="t-projects">{head('projects')}</section>
        <section className="panel" id="p-contact" aria-labelledby="t-contact">{head('contact')}</section>
      </Portfolio>
      <PhoneMenu />
      <Cursor />
      <Lightning />
    </>
  );
}
