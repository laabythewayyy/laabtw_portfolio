/**
 * What each dashboard list edits. The list page, the inline editor, the sidebar and the validator all read this.
 * Field types: text | textarea | percent | icon | url | select | bullets | toggle | image
 * Row display: rowTitle, rowMeta (grey line), rowBar (a mini level bar; rowMeta then sits next to the title),
 *              rowImage / rowIcon (the thumbnail; rowIcon may return '' to fall back to `icon`).
 */
const RESUME_ICONS = { education: 'fa-solid fa-graduation-cap', work: 'fa-solid fa-briefcase', achievement: 'fa-solid fa-trophy' };

export const ADMIN_SECTIONS = {
  skills: {
    table: 'skills',
    title: 'Skills',
    intro: 'The bars in About. Drag order = order on the site (left column first).',
    addLabel: 'Add skill',
    noun: 'skill',
    fields: [
      { name: 'name', label: 'Skill', type: 'text', required: true },
      { name: 'percent', label: 'Level (0–100)', type: 'percent', required: true },
    ],
    icon: 'fa-solid fa-chart-simple',
    rowTitle: (r) => r.name,
    rowMeta: (r) => `${r.percent}%`,
    rowBar: (r) => r.percent,
  },
  resume: {
    table: 'resume_entries',
    title: 'Resume',
    intro: 'Education and work experience show on the left, achievements on the right.',
    addLabel: 'Add entry',
    noun: 'entry',
    groupBy: 'kind',
    groups: [
      { value: 'education', label: 'Education' },
      { value: 'work', label: 'Work experience' },
      { value: 'achievement', label: 'Achievements' },
    ],
    fields: [
      {
        name: 'kind', label: 'Type', type: 'select', required: true,
        options: [
          { value: 'education', label: 'Education' },
          { value: 'work', label: 'Work experience' },
          { value: 'achievement', label: 'Achievement' },
        ],
      },
      { name: 'title', label: 'Title', type: 'text', required: true, hint: 'e.g. Bachelor of Computer Science, Front-end developer, Hackathon winner' },
      { name: 'date_label', label: 'Date', type: 'text', hint: 'e.g. 2021 – 2024, or Silver · 2022' },
      { name: 'place', label: 'Place', type: 'text', hint: 'School, company or organiser' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'bullets', label: 'Bullet points', type: 'bullets', hint: 'One point per line.' },
    ],
    icon: 'fa-solid fa-tag',
    rowTitle: (r) => r.title,
    rowMeta: (r) => [r.date_label, r.place].filter(Boolean).join(' · '),
    rowIcon: (r) => RESUME_ICONS[r.kind],
  },
  build: {
    table: 'build_items',
    title: 'What I build',
    intro: 'The website types in "What I can build for you" on the Projects section.',
    addLabel: 'Add item',
    noun: 'item',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'icon', label: 'Icon', type: 'icon', hint: 'A Font Awesome class, e.g. fa-solid fa-store' },
      { name: 'description', label: 'One short line', type: 'textarea' },
    ],
    icon: 'fa-solid fa-tag',
    rowTitle: (r) => r.title,
    rowMeta: (r) => r.description,
    rowIcon: (r) => r.icon,
  },
  projects: {
    table: 'projects',
    title: 'Projects',
    intro: 'The cards in "Things I\'ve built". Add a screenshot, links and a category.',
    addLabel: 'Add project',
    noun: 'project',
    emptyText: 'No projects yet. Add one to show it on your site.',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'category_id', label: 'Category', type: 'select', options: 'categories' },
      { name: 'image_url', label: 'Screenshot', type: 'image', folder: 'projects' },
      { name: 'live_url', label: 'Live site link', type: 'url' },
      { name: 'code_url', label: 'Code link', type: 'url' },
    ],
    icon: 'fa-regular fa-image',
    rowTitle: (r) => r.title,
    rowMeta: (r) => r.description,
    rowImage: (r) => r.image_url,
  },
  contacts: {
    table: 'contacts',
    title: 'Contacts',
    intro: 'Contact boxes, social media cards, and the icons under your name on the homepage.',
    addLabel: 'Add link',
    noun: 'link',
    groupBy: 'kind',
    groups: [
      { value: 'contact', label: 'Contact (Email, WhatsApp, Telegram…)' },
      { value: 'social', label: 'Social media' },
      { value: 'profile', label: 'Profiles (homepage only, e.g. GitHub, LinkedIn)' },
    ],
    fields: [
      {
        name: 'kind', label: 'Where it shows', type: 'select', required: true,
        options: [
          { value: 'contact', label: 'Contact box' },
          { value: 'social', label: 'Social media card' },
          { value: 'profile', label: 'Profile (homepage icons only)' },
        ],
      },
      { name: 'platform', label: 'Platform', type: 'text', required: true, hint: 'e.g. Instagram' },
      { name: 'icon', label: 'Icon', type: 'icon', hint: 'e.g. fa-brands fa-instagram' },
      { name: 'label', label: 'Shown text', type: 'text', hint: 'Your handle, number or email' },
      { name: 'url', label: 'Link', type: 'url', required: true, hint: 'https://…, mailto:… or tel:…' },
      { name: 'show_in_hero', label: 'Show under my name on the homepage', type: 'toggle' },
    ],
    icon: 'fa-solid fa-tag',
    rowTitle: (r) => r.platform,
    rowMeta: (r) => r.label || r.url,
    rowIcon: (r) => r.icon,
  },
  categories: {
    table: 'project_categories',
    title: 'Categories',
    addLabel: 'Add category',
    noun: 'category',
    fields: [{ name: 'name', label: 'Category', type: 'text', required: true }],
    rowTitle: (r) => r.name,
  },
};

/** The sections that have their own dashboard page (categories live inside Projects). */
export const LIST_PAGES = ['skills', 'resume', 'build', 'projects', 'contacts'];

/** Dashboard navigation (sidebar and overview cards), in menu order. */
export const ADMIN_NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/site', label: 'Site text' },
  ...LIST_PAGES.map((key) => ({ href: `/admin/${key}`, label: ADMIN_SECTIONS[key].title, section: key })),
];
