const DRIVE_HOSTS = new Set(['drive.google.com', 'docs.google.com'])

// Uploaded restaurant logos/banners and product images are stored as the URL
// `adapter.upload()` (longcelot-sheet-db's DriveStorageAdapter) returns —
// `https://drive.google.com/uc?id=FILE_ID` — which Drive serves with
// `Content-Disposition: attachment`, so an <img> tag pointed straight at it
// shows a broken image instead of rendering. Drive's thumbnail endpoint
// serves the same file with an inline image Content-Type instead, which is
// what actually renders. Keep storing/deleting the original `uc?id=` URL
// (that's the format `adapter.deleteFile()` expects) — only transform it here,
// at render time.
export function toDisplayImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  // Local previews (freshly picked files, via URL.createObjectURL) and any
  // non-Drive URL pass through unchanged.
  if (url.startsWith('blob:') || url.startsWith('data:')) return url

  let fileId: string | null | undefined
  try {
    const parsed = new URL(url)
    if (!DRIVE_HOSTS.has(parsed.hostname)) return url
    fileId =
      parsed.searchParams.get('id') ??
      parsed.pathname.match(/\/d\/([-\w]+)/)?.[1]
  } catch {
    return url
  }

  if (!fileId) return url
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
}
