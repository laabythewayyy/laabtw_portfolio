import { describe, expect, test } from 'vitest';
import { pageCount, pageIndex, perPage } from '@/lib/slider';

describe('perPage', () => {
  test('three cards fit on a desktop track', () => {
    expect(perPage(1100, 372.67)).toBe(3);
  });
  test('one card per page on a phone (cards are 86% wide)', () => {
    expect(perPage(300, 276)).toBe(1);
  });
});

describe('pageCount', () => {
  test('nine cards, three per page → 3 pages', () => expect(pageCount(9, 3)).toBe(3));
  test('four cards, three per page → 2 pages', () => expect(pageCount(4, 3)).toBe(2));
  test('no cards still has one page', () => expect(pageCount(0, 3)).toBe(1));
});

describe('pageIndex', () => {
  test('one page width scrolled → page 1', () => expect(pageIndex(1118, 1118, 3)).toBe(1));
  test('scrolled past the end → last page', () => expect(pageIndex(99999, 1118, 3)).toBe(2));
  test('negative scroll → first page', () => expect(pageIndex(-10, 1118, 3)).toBe(0));
});
