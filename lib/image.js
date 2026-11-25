/**
 * Upload size and in-browser image shrinking.
 * Next.js sends a dashboard form to the server in one request, and the hosting caps a request at
 * about 4.5 MB, so files are kept under MAX_UPLOAD_BYTES. Pictures are shrunk in the browser first,
 * which also makes the public site load faster.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_SIDE = 1600; // px: sharp on large screens, small to download

/** The size that fits within `max` on the longest side. Never enlarges. */
export function fitWithin(width, height, max = MAX_SIDE) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * Format to save as. JPG stays JPG, so it is still treated as a photo; PNG/WebP become WebP, which
 * keeps a transparent background (cut-out avatars) and is much smaller than PNG.
 */
export function outputType(inputType) {
  return inputType === 'image/jpeg' ? { type: 'image/jpeg', ext: 'jpg' } : { type: 'image/webp', ext: 'webp' };
}

/**
 * Browser only. Returns a smaller copy of an image File (or the original when shrinking doesn't help,
 * or the browser can't do it). Non-images are returned unchanged.
 */
export async function shrinkImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || typeof createImageBitmap !== 'function') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = fitWithin(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const out = outputType(file.type);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, out.type, 0.86));
    if (!blob || blob.type !== out.type || blob.size >= file.size) return file; // no gain, or format unsupported
    const name = file.name.replace(/\.[a-z0-9]+$/i, '') + '.' + out.ext;
    return new File([blob], name, { type: out.type, lastModified: Date.now() });
  } catch {
    return file;
  }
}
