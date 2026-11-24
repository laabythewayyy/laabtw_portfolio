/** How many whole cards fit in the visible track (at least 1). cardStep = card width + gap. */
export function perPage(trackWidth, cardStep, gap = 18) {
  return Math.max(1, Math.floor((trackWidth + gap + 1) / cardStep));
}

/** Number of pages for the visible cards (at least 1). */
export function pageCount(visibleCount, per) {
  return Math.max(1, Math.ceil(visibleCount / per));
}

/** Which page the scroll position is on, clamped to [0, pages-1]. */
export function pageIndex(scrollLeft, pageWidth, pages) {
  return Math.min(pages - 1, Math.max(0, Math.round(scrollLeft / pageWidth)));
}
