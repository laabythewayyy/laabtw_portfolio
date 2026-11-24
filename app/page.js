import { getSiteContent } from '@/lib/site-content';

// Temporary check page (replaced in Task 4): proves the content loads from Supabase.
export default async function Home() {
  const c = await getSiteContent();
  return (
    <pre style={{ padding: 24 }}>
      {JSON.stringify(
        {
          name: `${c.settings.first_name} ${c.settings.last_name}`,
          skills: c.skills.length,
          build: c.build.length,
          projects: c.projects.map((p) => `${p.title} (${p.category})`),
          filters: c.filters,
          hero: c.contacts.hero.map((h) => h.platform),
          resumeEmpty: c.resumeEmpty,
        },
        null,
        2,
      )}
    </pre>
  );
}
