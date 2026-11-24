import { describe, expect, test } from 'vitest';
import { renderBold } from '@/lib/format';

describe('renderBold', () => {
  test('turns **text** into <strong> and escapes the apostrophe', () => {
    expect(renderBold("I'm a **junior** dev")).toBe('I&#39;m a <strong>junior</strong> dev');
  });

  test('handles several bold parts', () => {
    expect(renderBold('**a** and **b**')).toBe('<strong>a</strong> and <strong>b</strong>');
  });

  test('shows typed HTML as plain text, never as tags', () => {
    expect(renderBold('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  test('leaves an unclosed ** as literal stars', () => {
    expect(renderBold('a **b')).toBe('a **b');
  });

  test('returns an empty string for null', () => {
    expect(renderBold(null)).toBe('');
  });
});
