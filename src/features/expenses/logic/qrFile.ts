import type { TextKey } from '@/shared/i18n';

/** Same limits as the `qr` storage bucket: image/* and at most 2 MB. */
export const QR_MAX_BYTES = 2 * 1024 * 1024;

/** Returns the i18n key of the problem, or null when the file is acceptable. */
export function qrFileError(f: { type: string; size: number }): TextKey | null {
  if (!f.type.startsWith('image/')) return 'expense.qrBadType';
  if (f.size > QR_MAX_BYTES) return 'expense.qrTooBig';
  return null;
}

/** Opens the browser file picker; resolves null when the user cancels. */
export function pickImage(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.oncancel = () => resolve(null);
    input.click();
  });
}
