import { describe, expect, test } from 'vitest';
import { validate, validateUpload } from '@/lib/admin/validate';

describe('validate: skills', () => {
  test('a skill needs a name', () => {
    const r = validate('skills', { name: '', percent: '50' });
    expect(r.ok).toBe(false);
    expect(r.errors.name).toBe('Add a name.');
  });
  test.each(['120', '-5', 'abc', ''])('percent %j is rejected', (percent) => {
    const r = validate('skills', { name: 'React', percent });
    expect(r.errors.percent).toBe('Enter a number from 0 to 100.');
  });
  test('a valid percent becomes a number', () => {
    const r = validate('skills', { name: ' React ', percent: '85' });
    expect(r).toEqual({ ok: true, value: { name: 'React', percent: 85 } });
  });
});

describe('validate: projects', () => {
  test('a link without https:// is rejected', () => {
    const r = validate('projects', { title: 'Shop', live_url: 'example.com' });
    expect(r.errors.live_url).toBe('Enter a full link starting with https://');
  });
  test('an empty optional link is allowed and stored as null', () => {
    const r = validate('projects', { title: 'Shop', live_url: '', code_url: '' });
    expect(r.ok).toBe(true);
    expect(r.value.live_url).toBeNull();
  });
  test('a project needs a title', () => {
    expect(validate('projects', { title: '  ' }).errors.title).toBe('Add a title.');
  });
});

describe('validate: contacts', () => {
  test('mailto: and tel: links are accepted', () => {
    expect(validate('contacts', { kind: 'contact', platform: 'Email', url: 'mailto:a@b.com', icon: '' }).ok).toBe(true);
    expect(validate('contacts', { kind: 'contact', platform: 'Phone', url: 'tel:+85512345678', icon: '' }).ok).toBe(true);
  });
  test('show_in_hero checkbox becomes a boolean', () => {
    const r = validate('contacts', { kind: 'profile', platform: 'GitHub', url: 'https://github.com/x', show_in_hero: 'on', icon: '' });
    expect(r.value.show_in_hero).toBe(true);
  });
  test('an icon must be a Font Awesome class', () => {
    const r = validate('contacts', { kind: 'social', platform: 'X', url: 'https://x.com', icon: 'twitter' });
    expect(r.errors.icon).toBe('Use a Font Awesome class like fa-brands fa-github.');
  });
});

describe('validate: resume', () => {
  test('bullets are split into lines, trimmed, empties removed', () => {
    const r = validate('resume', { kind: 'work', title: 'Dev', bullets: 'One\n\n Two \n' });
    expect(r.value.bullets).toEqual(['One', 'Two']);
  });
  test('an unknown kind is rejected', () => {
    const r = validate('resume', { kind: 'job', title: 'Dev' });
    expect(r.errors.kind).toBe('Choose Education, Work experience or Achievement.');
  });
});

describe('validateUpload', () => {
  test('images over 4 MB are rejected (hosting caps a request at about 4.5 MB)', () => {
    expect(validateUpload({ size: 4.5 * 1024 * 1024, type: 'image/png' }, 'image')).toBe('Images must be 4 MB or smaller.');
    expect(validateUpload({ size: 4.5 * 1024 * 1024, type: 'application/pdf' }, 'pdf')).toBe('Files must be 4 MB or smaller.');
  });
  test('only JPG, PNG and WebP images', () => {
    expect(validateUpload({ size: 1000, type: 'image/gif' }, 'image')).toBe('Upload a JPG, PNG or WebP image.');
  });
  test('the CV must be a PDF', () => {
    expect(validateUpload({ size: 1000, type: 'image/png' }, 'pdf')).toBe('Upload a PDF file.');
  });
  test('a good image passes', () => {
    expect(validateUpload({ size: 1000, type: 'image/webp' }, 'image')).toBeNull();
  });
});

describe('unknown sections', () => {
  test('names that exist on every JS object are rejected, not looked up', async () => {
    const { validate } = await import('@/lib/admin/validate');
    expect(() => validate('constructor', {})).toThrow(/Unknown section/);
    expect(() => validate('__proto__', {})).toThrow(/Unknown section/);
  });
});
