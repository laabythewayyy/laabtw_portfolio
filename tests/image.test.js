import { describe, expect, test } from 'vitest';
import { fitWithin, outputType, MAX_UPLOAD_BYTES } from '@/lib/image';

describe('fitWithin', () => {
  test('scales the longest side down to the limit, keeping the shape', () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(1080, 1920, 1600)).toEqual({ width: 900, height: 1600 });
  });
  test('never enlarges a small picture', () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
});

describe('outputType', () => {
  test('JPG stays JPG (a photo); PNG/WebP become WebP (keeps transparency)', () => {
    expect(outputType('image/jpeg')).toEqual({ type: 'image/jpeg', ext: 'jpg' });
    expect(outputType('image/png')).toEqual({ type: 'image/webp', ext: 'webp' });
    expect(outputType('image/webp')).toEqual({ type: 'image/webp', ext: 'webp' });
  });
});

test('the upload limit stays under the hosting limit (4.5 MB)', () => {
  expect(MAX_UPLOAD_BYTES).toBe(4 * 1024 * 1024);
});
