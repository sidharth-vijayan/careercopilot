/**
 * Resolve the in-bucket object path for a stored resume.
 *
 * Uploads save `storageData.path` (e.g. "<userId>/<uuid>.pdf"), but rows
 * written by earlier versions may hold a full public URL, so accept both.
 *
 * Lives here rather than in an action file because every export of a
 * `"use server"` module becomes a server action and has to be async — and both
 * `deleteResume` and `deleteAccount` need this synchronously.
 */
export function storagePathFromUrl(fileUrl: string): string | null {
  if (!fileUrl) return null;

  const marker = "/object/public/resumes/";
  const idx = fileUrl.indexOf(marker);
  if (idx !== -1) return decodeURIComponent(fileUrl.slice(idx + marker.length));

  // Already a bare path; anything else (an unrecognised URL) is not ours.
  return fileUrl.startsWith("http") ? null : fileUrl;
}
