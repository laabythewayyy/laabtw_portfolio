import { describe, expect, it, vi } from 'vitest';
import { applyUploads } from '@/lib/admin/uploads';

const form = (entries) => ({ get: (k) => entries[k] ?? null });
const file = (type, size = 10, name = 'a.png') => ({ type, size, name });
const SPECS = [{ field: 'image_url', input: 'image_url__file', kind: 'image', folder: 'projects' }];

describe('applyUploads', () => {
  it('stores the uploaded URL in the value', async () => {
    const upload = vi.fn(async () => 'https://cdn/x.png');
    const value = { image_url: 'old' };
    const errors = await applyUploads(form({ image_url__file: file('image/png') }), SPECS, value, upload);
    expect(errors).toEqual({});
    expect(value.image_url).toBe('https://cdn/x.png');
    expect(upload).toHaveBeenCalledWith(expect.objectContaining({ type: 'image/png' }), 'projects');
  });

  it('clears the value when "remove" is ticked', async () => {
    const value = { image_url: 'old' };
    await applyUploads(form({ image_url__remove: 'on' }), SPECS, value, vi.fn());
    expect(value.image_url).toBeNull();
  });

  it('ignores an empty file input', async () => {
    const upload = vi.fn();
    const value = { image_url: 'old' };
    await applyUploads(form({ image_url__file: file('application/octet-stream', 0) }), SPECS, value, upload);
    expect(upload).not.toHaveBeenCalled();
    expect(value.image_url).toBe('old');
  });

  it('returns a field error for a wrong file type without uploading', async () => {
    const upload = vi.fn();
    const errors = await applyUploads(form({ image_url__file: file('text/plain') }), SPECS, {}, upload);
    expect(errors.image_url).toMatch(/JPG, PNG or WebP/);
    expect(upload).not.toHaveBeenCalled();
  });

  it('returns a field error when the upload fails', async () => {
    const errors = await applyUploads(form({ image_url__file: file('image/png') }), SPECS, {}, async () => { throw new Error('x'); });
    expect(errors.image_url).toBe('Upload failed. Try again.');
  });
});
