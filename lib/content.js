export const DEFAULT_SETTINGS = {
  first_name: '',
  last_name: '',
  role_line: '',
  avatar_url: null,
  open_to_work: true,
  cv_url: null,
  about_title: '',
  about_body: '',
  about_body_2: '',
  about_facts: [],
  section_headers: {
    about: { label: 'About', heading: 'Learn more about me' },
    resume: { label: 'Resume', heading: 'Check my resume' },
    projects: { label: 'Projects', heading: 'My work' },
    contact: { label: 'Contact', heading: "Let's work together" },
  },
  block_titles: {
    skills: 'Skills',
    build: 'What I can build for you',
    built: "Things I've built",
    social: 'Social media',
  },
  build_more_text: '',
  copyright_text: '',
  site_title: 'Tola Sann',
};

export const FALLBACK_AVATAR = '/avatartola.png';
export const FALLBACK_CV = '/portfolio-tola.pdf';

const bySortOrder = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0);
const sorted = (rows) => [...(rows ?? [])].sort(bySortOrder);
const clampPercent = (n) => Math.min(100, Math.max(0, Math.round(Number(n) || 0)));

/** Database values win; anything missing (or an empty jsonb object) keeps its default. */
function mergeSettings(row) {
  const s = { ...DEFAULT_SETTINGS };
  if (!row) return s;
  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined) continue;
    s[key] = value;
  }
  s.section_headers = { ...DEFAULT_SETTINGS.section_headers };
  for (const [key, value] of Object.entries(row.section_headers ?? {})) {
    s.section_headers[key] = { ...DEFAULT_SETTINGS.section_headers[key], ...value };
  }
  s.block_titles = { ...DEFAULT_SETTINGS.block_titles, ...(row.block_titles ?? {}) };
  if (!Array.isArray(s.about_facts)) s.about_facts = [];
  return s;
}

/** Filter buttons: "All", then each category (in order) that has at least one project. */
export function buildFilters(categories, projects) {
  const used = new Set((projects ?? []).map((p) => p.category_id));
  return ['All', ...sorted(categories).filter((c) => used.has(c.id)).map((c) => c.name)];
}

/** Turns raw table rows into exactly what the public site renders. */
export function shapeContent(raw) {
  const settings = mergeSettings(raw.settings);
  const categories = sorted(raw.categories);
  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  const resumeRows = sorted(raw.resume);
  const contacts = sorted(raw.contacts);

  return {
    settings,
    avatarUrl: settings.avatar_url || FALLBACK_AVATAR,
    cvUrl: settings.cv_url || FALLBACK_CV,
    skills: sorted(raw.skills).map((s) => ({ ...s, percent: clampPercent(s.percent) })),
    resume: {
      education: resumeRows.filter((r) => r.kind === 'education'),
      work: resumeRows.filter((r) => r.kind === 'work'),
      achievement: resumeRows.filter((r) => r.kind === 'achievement'),
    },
    resumeEmpty: resumeRows.length === 0,
    build: sorted(raw.build),
    projects: sorted(raw.projects).map((p) => ({ ...p, category: nameById.get(p.category_id) ?? '' })),
    filters: buildFilters(categories, raw.projects),
    contacts: {
      contact: contacts.filter((c) => c.kind === 'contact'),
      social: contacts.filter((c) => c.kind === 'social'),
      hero: contacts.filter((c) => c.show_in_hero),
    },
  };
}
