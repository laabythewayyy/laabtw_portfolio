const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Make any text safe to put into HTML. */
export function escapeHtml(text) {
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
