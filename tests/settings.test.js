import { describe, expect, test } from 'vitest';
import { parseSettingsForm } from '@/lib/admin/settings';

const form = (obj) => ({ get: (k) => (k in obj ? obj[k] : null) });

describe('parseSettingsForm', () => {
  test('trims text fields', () => {
    const v = parseSettingsForm(form({ first_name: '  Tola ', last_name: 'Sann' }));
    expect(v.first_name).toBe('Tola');
    expect(v.last_name).toBe('Sann');
  });

  test('open_to_work comes from the checkbox', () => {
    expect(parseSettingsForm(form({ open_to_work: 'on' })).open_to_work).toBe(true);
    expect(parseSettingsForm(form({})).open_to_work).toBe(false);
  });

  test('info list rows without a label are dropped and values are trimmed', () => {
    const facts = JSON.stringify([{ label: ' City ', value: ' Phnom Penh ' }, { label: '', value: 'x' }]);
    expect(parseSettingsForm(form({ about_facts: facts })).about_facts).toEqual([{ label: 'City', value: 'Phnom Penh' }]);
  });

  test('broken info list JSON becomes an empty list instead of crashing', () => {
    expect(parseSettingsForm(form({ about_facts: '{oops' })).about_facts).toEqual([]);
  });

  test('section headers and block titles are collected from their inputs', () => {
    const v = parseSettingsForm(form({ sh_about_label: 'About', sh_about_heading: 'Who I am', bt_skills: 'My skills' }));
    expect(v.section_headers.about).toEqual({ label: 'About', heading: 'Who I am' });
    expect(v.block_titles.skills).toBe('My skills');
  });

  test('an empty header falls back to the default instead of showing nothing', () => {
    const v = parseSettingsForm(form({ sh_contact_label: '', sh_contact_heading: '' }));
    expect(v.section_headers.contact).toEqual({ label: 'Contact', heading: "Let's work together" });
  });
});

describe('site title', () => {
  test('an empty browser tab title falls back to the default instead of going blank', async () => {
    const { parseSettingsForm } = await import('@/lib/admin/settings');
    const v = parseSettingsForm({ get: (k) => (k === 'site_title' ? '   ' : null) });
    expect(v.site_title).toBe('Tola Sann');
  });
});
