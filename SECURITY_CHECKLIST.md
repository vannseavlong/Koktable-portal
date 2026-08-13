# Security Checklist — OWASP Top 10:2025 (Portal)

Baseline audit of the admin portal (React/TanStack, talks to `Backend`) against the [OWASP Top 10:2025](https://owasp.org/Top10/2025/0x00_2025-Introduction/).
Client-side apps don't map 1:1 onto a server-focused list — items below are the subset that applies to a SPA, plus what it inherits from `Backend/SECURITY_CHECKLIST.md`.
Checked items are already true of this codebase as of 2026-08-13; unchecked items are gaps to close, worked one at a time.

## A01:2025 — Broken Access Control
- [x] `api-client.ts` attaches `Authorization: Bearer <token>` from `auth-store`, doesn't roll its own auth logic
- [ ] Audit route guards — confirm every admin/merchant-only TanStack Router route actually checks `auth-store` state before rendering, not just before firing the API call (a client-side-only guard is UX, not security, but its absence would mean the API is the *only* enforcement — confirm that's acceptable and intentional)
- [ ] Confirm the portal never trusts a role/permission claim client-side for anything the Backend doesn't also independently enforce

## A02:2025 — Security Misconfiguration
- [x] CSP added as a `<meta http-equiv="Content-Security-Policy">` baseline in `index.html` (`default-src 'self'` plus explicit allowances for Google Fonts, Drive/`googleusercontent` images, and `connect-src` to the API base URL); verified against a live `pnpm dev` + Chrome session (no console CSP violations, HMR/fast-refresh still worked) and a real `pnpm build` output
- [ ] No security headers audit done for the static hosting layer (HSTS, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`) — a `<meta>` CSP can't carry these (and browsers ignore `frame-ancestors` in `<meta>` specifically); this needs to be set at the hosting/CDN layer, which this repo doesn't control — deploy-infra follow-up
- [x] `VITE_API_BASE_URL` is the only `VITE_*` var in use (`grep -r import.meta.env.VITE_ src`) — a public API URL, not a secret

## A03:2025 — Software Supply Chain Failures
- [x] CI (`.github/workflows/ci.yml`) runs lint, format check, tests, and build on every push/PR — the only one of the three repos with CI today
- [x] CI now runs `pnpm audit --audit-level=high` as its own step; also bumped `vitest`/`@vitest/*`/`vite` and added scoped `pnpm-workspace.yaml` `overrides` (`minimatch`, `brace-expansion`, `picomatch`, `lodash-es`) for transitive-only high/critical findings that had no direct-dependency fix available, so the new step passes clean today (2 low findings remain, below the `--audit-level=high` gate)
- [x] `pnpm-lock.yaml` committed and installed with `--frozen-lockfile` in CI ✅ (already true — verified)

## A04:2025 — Cryptographic Failures
- [x] Auth token stored in a cookie (`KokTable_admin_access_token`) rather than `localStorage` — narrows (but doesn't eliminate) the exfiltration surface for a token-stealing XSS
- [x] `lib/cookies.ts` now sets `SameSite=Strict` on every cookie, plus `Secure` gated on `window.location.protocol === 'https:'` (so it still works on `http://localhost` in dev). The `HttpOnly` trade-off is documented directly at the cookie helper: it can't be set, because `auth-store.ts` needs to read/write the cookie from client JS.
- [ ] No client-side encryption expectation here — flag only if any sensitive data is ever cached in the cookie/localStorage beyond the token + user object already in use

## A05:2025 — Injection
- [x] No `dangerouslySetInnerHTML` usage found — React's default escaping isn't being bypassed anywhere
- [ ] Audit any place user-supplied text is rendered as Markdown/HTML in the future (none found today — keep it that way, or add sanitization when it appears)

## A06:2025 — Insecure Design
- [ ] Confirm login form has client-side lockout/backoff UX to match whatever the Backend ends up enforcing (see `Backend/SECURITY_CHECKLIST.md` A06) — out of scope for this pass: Backend doesn't yet have the rate-limit primitive to key this off of
- [ ] Confirm file-upload UI enforces the same type/size limits as the Backend's `multer` config, so users get instant feedback instead of relying on the server rejection

## A07:2025 — Authentication Failures
- [ ] Inherits the Backend's non-expiring-token gap — the portal has no client-side session timeout of its own either (a stolen cookie works indefinitely) — out of scope: no change to the bearer-token-in-cookie architecture in this pass
- [ ] No MFA option surfaced in the UI (ties to Backend A07) — out of scope for this pass
- [x] `SignOutDialog`'s `handleSignOut` now calls `POST /user/auth/logout` (revokes the token server-side, see Backend's `revoked_tokens` table) before `auth.reset()` clears local state; best-effort (local state still clears if the revoke call fails, e.g. already-expired token or network error)

## A08:2025 — Software or Data Integrity Failures
- [ ] Confirm `pnpm build` output is what actually gets deployed (no manual/undocumented build step that could be tampered with) — CI already builds, verify deploy consumes that artifact rather than a separate local build

## A09:2025 — Security Logging & Alerting Failures
- [ ] No client-side error/crash reporting (Sentry or similar) — failed logins, unexpected 401/403s, and JS exceptions in the admin portal are currently invisible unless a user reports them
- [ ] Decide whether the portal needs its own logging story or whether Backend-side audit logging (once added) is sufficient

## A10:2025 — Mishandling of Exceptional Conditions
- [x] `ApiError` gives call sites a typed shape (`status`, `message`, `details`) to branch on instead of guessing at response shape
- [x] Route-tree render/loader errors were already caught by TanStack Router's `errorComponent: GeneralError` (`routes/__root.tsx`), but that depends on `useRouter()` context, so it can't catch a crash in `RouterProvider` itself or the providers around it. Added `components/error-boundary.tsx`, a plain React class `ErrorBoundary` (dependency-free fallback UI, no router hooks) wrapping the whole tree in `main.tsx` as the true top-level safety net.
