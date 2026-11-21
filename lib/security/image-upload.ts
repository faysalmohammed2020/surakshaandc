export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type ImageKind = { mime: string; ext: string };

/** Identify an image from its magic bytes (never trust the client MIME type). */
export function detectImageKind(b: Uint8Array): ImageKind | null {
  const is = (...sig: number[]) => sig.every((v, i) => b[i] === v);
  if (is(0xff, 0xd8, 0xff)) return { mime: "image/jpeg", ext: "jpg" };
  if (is(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return { mime: "image/png", ext: "png" };
  if (is(0x47, 0x49, 0x46, 0x38)) return { mime: "image/gif", ext: "gif" };
  if (is(0x52, 0x49, 0x46, 0x46) && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50)
    return { mime: "image/webp", ext: "webp" };
  return null;
}
