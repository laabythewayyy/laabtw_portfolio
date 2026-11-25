import { describe, expect, test } from 'vitest';
import { buildFilters, shapeContent } from '@/lib/content';

const empty = { settings: null, skills: [], resume: [], build: [], categories: [], projects: [], contacts: [] };

describe('shapeContent', () => {
  test('groups resume entries by kind, sorted by sort_order', () => {
    const c = shapeContent({
      ...empty,
      resume: [
        { id: 'w2', kind: 'work', title: 'B', sort_order: 2 },
        { id: 'e1', kind: 'education', title: 'Uni', sort_order: 0 },
        { id: 'w1', kind: 'work', title: 'A', sort_order: 1 },
        { id: 'a1', kind: 'achievement', title: 'Win', sort_order: 3 },
      ],
    });
    expect(c.resume.education.map((r) => r.id)).toEqual(['e1']);
    expect(c.resume.work.map((r) => r.id)).toEqual(['w1', 'w2']);
    expect(c.resume.achievement.map((r) => r.id)).toEqual(['a1']);
    expect(c.resumeEmpty).toBe(false);
  });

  test('resumeEmpty is true when there are no entries', () => {
    expect(shapeContent(empty).resumeEmpty).toBe(true);
  });

  test('a project with an unknown or missing category gets an empty category name', () => {
    const c = shapeContent({
      ...empty,
      categories: [{ id: 'c1', name: 'Website', sort_order: 0 }],
      projects: [
        { id: 'p1', title: 'X', category_id: 'gone', sort_order: 0 },
        { id: 'p2', title: 'Y', category_id: null, sort_order: 1 },
      ],
    });
    expect(c.projects.map((p) => p.category)).toEqual(['', '']);
    expect(c.filters).toEqual(['All']);
  });

  test('clamps skill percentages to 0-100', () => {
    const c = shapeContent({
      ...empty,
      skills: [
        { id: 's1', name: 'Too high', percent: 140, sort_order: 0 },
        { id: 's2', name: 'Too low', percent: -5, sort_order: 1 },
      ],
    });
    expect(c.skills.map((s) => s.percent)).toEqual([100, 0]);
  });

  test('hero links come from show_in_hero rows of every kind; contact excludes profiles', () => {
    const c = shapeContent({
      ...empty,
      contacts: [
        { id: 'tg', kind: 'contact', platform: 'Telegram', show_in_hero: true, sort_order: 4 },
        { id: 'gh', kind: 'profile', platform: 'GitHub', show_in_hero: true, sort_order: 0 },
        { id: 'wa', kind: 'contact', platform: 'WhatsApp', show_in_hero: false, sort_order: 3 },
        { id: 'ig', kind: 'social', platform: 'Instagram', show_in_hero: false, sort_order: 5 },
      ],
    });
    expect(c.contacts.hero.map((r) => r.id)).toEqual(['gh', 'tg']);
    expect(c.contacts.contact.map((r) => r.id)).toEqual(['wa', 'tg']);
    expect(c.contacts.social.map((r) => r.id)).toEqual(['ig']);
  });

  test('missing settings fall back to defaults and the bundled avatar and CV', () => {
    const c = shapeContent(empty);
    expect(c.settings.section_headers.about.heading).toBe('Learn more about me');
    expect(c.avatarUrl).toBe('/avatartola.png');
    expect(c.cvUrl).toBe('/portfolio-tola.pdf');
  });

  test('a partial block_titles object keeps the other defaults', () => {
    const c = shapeContent({ ...empty, settings: { id: 1, block_titles: { skills: 'My skills' } } });
    expect(c.settings.block_titles.skills).toBe('My skills');
    expect(c.settings.block_titles.social).toBe('Social media');
  });

  test('uploaded avatar and CV urls are used when set', () => {
    const c = shapeContent({ ...empty, settings: { id: 1, avatar_url: 'https://x/a.png', cv_url: 'https://x/cv.pdf' } });
    expect(c.avatarUrl).toBe('https://x/a.png');
    expect(c.cvUrl).toBe('https://x/cv.pdf');
  });
});

describe('buildFilters', () => {
  test('only categories that have projects get a button, after All', () => {
    expect(buildFilters([{ id: 1, name: 'Website' }, { id: 2, name: 'Design' }], [{ category_id: 1 }])).toEqual([
      'All',
      'Website',
    ]);
  });
});

describe('about photo', () => {
  test('uses its own uploaded photo when there is one', () => {
    const c = shapeContent({ ...empty, settings: { avatar_url: 'https://cdn/home.png', about_image_url: 'https://cdn/about.png' } });
    expect(c.aboutImageUrl).toBe('https://cdn/about.png');
    expect(c.avatarUrl).toBe('https://cdn/home.png');
  });

  test('falls back to the homepage avatar when none is uploaded', () => {
    const c = shapeContent({ ...empty, settings: { avatar_url: 'https://cdn/home.png' } });
    expect(c.aboutImageUrl).toBe('https://cdn/home.png');
    expect(shapeContent(empty).aboutImageUrl).toBe('/avatartola.png');
  });
});

describe('photoFit', () => {
  test('JPG uploads are photos; PNG/WebP are treated as cut-outs', async () => {
    const { photoFit } = await import('@/lib/content');
    expect(photoFit('https://x.supabase.co/media/avatar/123-me.jpg')).toBe('photo');
    expect(photoFit('https://x/me.JPEG?v=2')).toBe('photo');
    expect(photoFit('/avatartola.png')).toBe('cutout');
    expect(photoFit('https://x/me.webp')).toBe('cutout');
    expect(photoFit('')).toBe('cutout');
  });
});

describe('avatarFrame', () => {
  test('automatic: cut-outs zoom 1.22, photos 1, both centred (y 0)', async () => {
    const { avatarFrame } = await import('@/lib/content');
    expect(avatarFrame('/avatartola.png')).toEqual({ fit: 'cutout', zoom: 1.22, y: 0 });
    expect(avatarFrame('https://x/me.jpg')).toEqual({ fit: 'photo', zoom: 1, y: 0 });
  });

  test('saved zoom / up-down win over automatic', async () => {
    const { avatarFrame } = await import('@/lib/content');
    expect(avatarFrame('/a.png', 1.5, -10)).toEqual({ fit: 'cutout', zoom: 1.5, y: -10 });
    expect(avatarFrame('/a.png', null, 8)).toEqual({ fit: 'cutout', zoom: 1.22, y: 8 });
  });
});
