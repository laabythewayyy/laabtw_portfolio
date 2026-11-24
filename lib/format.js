const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Make any text safe to put into HTML. */
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

/**
 * The only formatting the dashboard allows: **bold**.
 * The text is escaped first, so typed HTML always shows as plain text.
 * Returns an HTML string whose only tag is <strong>.
 */
export function renderBold(text) {
  if (text == null) return '';
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** Dashboard text without the ** markers, for places that can't show bold (page description, link previews). */
export function plainText(text) {
  if (text == null) return '';
  return String(text).replace(/\*\*(.+?)\*\*/g, '$1').trim();
}
