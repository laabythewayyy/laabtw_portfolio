/** The five sections, in menu order. `id` is used for #hash, data-s and the panel id (p-<id>). */
export const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'resume', label: 'Resume' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];
export const SECTION_IDS = SECTIONS.map((s) => s.id);
