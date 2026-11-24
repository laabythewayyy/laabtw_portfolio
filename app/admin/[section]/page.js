import { notFound } from 'next/navigation';
import { LIST_PAGES } from '@/lib/admin/schema';
import { listRows } from '@/lib/admin/crud';
import RowList from '@/components/admin/RowList';

/** /admin/skills | resume | build | projects | contacts: one list page driven by lib/admin/schema.js */
export default async function ListPage({ params }) {
  const { section } = await params;
  if (!LIST_PAGES.includes(section)) notFound();

  const rows = await listRows(section);
  const categories = section === 'projects' ? await listRows('categories') : [];

  return (
    <>
      <RowList section={section} rows={rows} categories={categories} />
      {section === 'projects' && (
        <div style={{ marginTop: 48 }}>
          <RowList section="categories" rows={categories} headingLevel="sub" />
          <p className="hint" style={{ marginTop: 10 }}>
            Categories become the filter buttons. Deleting one keeps its projects; they just lose that category.
          </p>
        </div>
      )}
    </>
  );
}
