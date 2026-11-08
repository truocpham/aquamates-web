import type { TextKey } from '@/shared/i18n';

/** Raster formats only: SVG can carry script. At most 2 MB, as the `qr` storage bucket. */
export const QR_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const QR_MAX_BYTES = 2 * 1024 * 1024;

/** Returns the i18n key of the problem, or null when the file is acceptable. */
export function qrFileError(f: { type: string; size: number }): TextKey | null {
  if (!QR_TYPES.includes(f.type)) return 'expense.qrBadType';
  if (f.size > QR_MAX_BYTES) return 'expense.qrTooBig';
  return null;
}

/** Opens the browser file picker; resolves null when the user cancels. */
export function pickImage(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = QR_TYPES.join(',');
    // Firefox only fires change for inputs that are attached to the document.
    input.style.display = 'none';
    const done = (f: File | null) => {
      input.remove();
      resolve(f);
    };
    input.onchange = () => done(input.files?.[0] ?? null);
    input.oncancel = () => done(null);
    document.body.appendChild(input);
    input.click();
  });
}
