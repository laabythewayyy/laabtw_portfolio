import { renderBold } from '@/lib/format';

/** Text from the dashboard. Only **bold** becomes formatting; any typed HTML shows as plain text. */
export default function RichText({ text, as: Tag = 'p', className }) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: renderBold(text) }} />;
}
