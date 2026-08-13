/**
 * Cookie utility functions using manual document.cookie approach
 * Replaces js-cookie dependency for better consistency
 */

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// SameSite=Strict is safe here (not just Lax): these cookies are only ever
// read back by this app's own JS via document.cookie, never sent as a
// `Cookie` header to the Backend API (auth calls carry the token as an
// `Authorization: Bearer` header instead, see api-client.ts) — so there's no
// cross-site request during the Google OAuth redirect that depends on the
// browser auto-attaching it. `Secure` is only added when actually served
// over https, so it keeps working on http://localhost in dev.
// These can't be `HttpOnly` — the app reads/writes them from client JS
// (auth-store.ts), which is exactly what `HttpOnly` would block.
function cookieAttributes(maxAge: number): string {
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
  return `path=/; max-age=${maxAge}; SameSite=Strict${secure ? '; Secure' : ''}`
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift()
    return cookieValue
  }
  return undefined
}

/**
 * Set a cookie with name, value, and optional max age
 */
export function setCookie(
  name: string,
  value: string,
  maxAge: number = DEFAULT_MAX_AGE
): void {
  if (typeof document === 'undefined') return

  document.cookie = `${name}=${value}; ${cookieAttributes(maxAge)}`
}

/**
 * Remove a cookie by setting its max age to 0
 */
export function removeCookie(name: string): void {
  if (typeof document === 'undefined') return

  document.cookie = `${name}=; ${cookieAttributes(0)}`
}
