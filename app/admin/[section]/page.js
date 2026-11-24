import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { LIST_PAGES } from '@/lib/admin/schema';
import { listRows } from '@/lib/admin/crud';
import RowList from '@/components/admin/RowList';
import CategoryChips from '@/components/admin/CategoryChips';
import Loading from '@/components/admin/Loading';

/** The rows themselves: reads the session and the database, so it streams in behind the loader. */
async function Rows({ params }) {
  const { section } = await params;
  if (!LIST_PAGES.includes(section)) notFound();

  const [rows, categories] = await Promise.all([
    listRows(section),
    section === 'projects' ? listRows('categories') : [],
  ]);
  return (
    <>
      <RowList section={section} rows={rows} categories={categories} />
      {section === 'projects' && <CategoryChips categories={categories} />}
    </>
  );
}

/** /admin/skills | resume | build | projects | contacts: one list page driven by lib/admin/schema.js */
export default function ListPage({ params }) {
  return (
    <Suspense fallback={<Loading />}>
      <Rows params={params} />
    </Suspense>
  );
}
