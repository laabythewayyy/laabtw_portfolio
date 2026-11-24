import { getSiteContent } from '@/lib/site-content';
import { plainText } from '@/lib/format';
import Portfolio from '@/components/site/Portfolio';
import Intro from '@/components/site/Intro';
import HeroArt from '@/components/site/HeroArt';
import PhoneMenu from '@/components/site/PhoneMenu';
import Cursor from '@/components/site/Cursor';
import Lightning from '@/components/site/Lightning';
import AboutPanel from '@/components/site/AboutPanel';
import ResumePanel from '@/components/site/ResumePanel';
import ProjectsPanel from '@/components/site/ProjectsPanel';
import ContactPanel from '@/components/site/ContactPanel';

export async function generateMetadata() {
  const { settings } = await getSiteContent();
  const description = plainText(settings.role_line) || undefined;
  return {
    title: settings.site_title,
    description,
    openGraph: { title: settings.site_title, description, type: 'website' },
  };
}

export default async function Home() {
  const content = await getSiteContent();
  const { settings } = content;
  return (
    <>
      <Portfolio>
        <div className="home">
          <Intro settings={settings} cvUrl={content.cvUrl} heroLinks={content.contacts.hero} />
          <HeroArt avatarUrl={content.avatarUrl} openToWork={settings.open_to_work} />
        </div>
        <AboutPanel settings={settings} avatarUrl={content.avatarUrl} cvUrl={content.cvUrl} skills={content.skills} />
        <ResumePanel settings={settings} resume={content.resume} resumeEmpty={content.resumeEmpty} />
        <ProjectsPanel settings={settings} build={content.build} projects={content.projects} filters={content.filters} />
        <ContactPanel settings={settings} contacts={content.contacts} />
      </Portfolio>
      <PhoneMenu />
      <Cursor />
      <Lightning />
    </>
  );
}
