# Paw — Project Status

Tracks status across all three repos in `/Users/suntel/personal/paw`:
`paw_sheetDB` (backend), `admin_portal` (this repo), `pet_carrying_app` (mobile).
Last updated 2026-07-21.

## Done

### `paw_sheetDB` (backend) — Merchant Operations (2026-07-21)
- **Merchant order management**: new `GET/GET :id/PATCH :id /merchant/orders`
  (`src/services/merchant/orders.service.ts` + controller + routes), mirroring
  `/admin/bookings`'s fan-out-over-every-user-sheet pattern but forced to the
  caller's own `shop_id` (from the JWT, never client-supplied) — same
  status machine (`pending→confirmed→active→completed`, `cancelled` from any
  non-terminal state) admin already had, no new "exchange/return" status.
  `usersWithSheets()`/`findUser()` extracted out of `admin/bookings.service.ts`
  into shared `src/services/shared/bookingLookup.ts` so both services fan out
  the same way instead of duplicating it.
- **Stock (products) + capacity (services)**: two new optional columns on
  `catalog_items` — `quantity` (product stock, decremented per booking, blocks
  at 0) and `daily_capacity` (service booking cap per overlapping date range).
  `src/utils/stockAdjustment.ts` (`decrementIfProduct`/`restockIfProduct`,
  wrapped in the existing per-key `withLock` mutex, same single-process-only
  tradeoff already accepted for invite redemption) wired into booking create
  (blocks out-of-stock creates) and every cancel path (customer self-cancel,
  admin, and the new merchant orders endpoint) for restock. Capacity check in
  `bookings.service.ts` (`checkServiceCapacity`) is explicitly a **soft,
  best-effort** check — no shared bookings table exists, so it fans out over
  every user-with-a-sheet on each booking attempt; has a race window and isn't
  multi-instance-safe, same tradeoff class as the existing mutex.
- 15 new vitest cases (`test/merchant/orders.test.ts`, additions to
  `test/bookings.test.ts`) covering shop-scoping/404s, status transitions,
  stock block/restock, and capacity rejection. `pnpm build` and `pnpm test`
  both pass clean (101/101).
- **Not yet done**: `pnpm db:sync` has **not** been run — the new `quantity`/
  `daily_capacity` columns exist only in `schemas/admin/catalog_items.ts`
  locally, not yet pushed to the live Google Sheet. Needs an explicit
  go-ahead before running against production data.

### `admin_portal` (this repo) — Merchant Operations (2026-07-21)
- **"My Orders"** (`src/features/my-orders/`): near-verbatim clone of the
  admin `orders` feature's provider/dialogs/status-dialog/detail-dialog/
  columns/table pattern, repointed at `/merchant/orders` (no shop filter —
  always the caller's own shop). New route `/my-orders`
  (`requireMerchantRole`), added to the merchant sidebar nav group.
- **My Catalog stock fields**: `quantity`/`daily_capacity` added to
  `data/schema.ts`, `catalog-items-api.ts` payload types, and the
  mutate-dialog form (`z.coerce.number().min(0).optional()`, conditionally
  rendered — `quantity` only when `item_type === 'product'`,
  `daily_capacity` only when `'service'`, via `form.watch('item_type')`).
  New "Stock/Capacity" table column.
- `pnpm build` (`tsc -b && vite build`) passes clean.
- **Not yet done / not verified**:
  - No live manual verification yet — haven't run the admin_portal dev server
    against a running backend and clicked through My Orders / the new My
    Catalog fields in a browser.
  - No end-to-end backend verification either — haven't created a real
    `item_id`-based booking via a seeded test user/shop and confirmed it
    shows up correctly in `/merchant/orders` against live (non-test) data.
  - No new automated tests added in this repo for My Orders / the My Catalog
    stock fields (same pre-existing gap already noted below for
    Orders/Content/Users).
  - Nothing committed — all of the above is sitting in the working tree only
    (`git status`: 6 modified + 2 new untracked feature/route directories).
  - Real production bookings will mostly **not** appear in My Orders until
    `pet_carrying_app` sends `item_id` on booking creation (still Phase 4
    below, not done) — `booking.shop_id` stays blank on the legacy
    `service_id` path, so this feature is correct but has near-empty data to
    act on until that mobile-side work lands.

### `paw_sheetDB` (backend)
- Upgraded `longcelot-sheet-db` 0.1.18 → 0.1.39; fixed the breaking `createUserSheet`
  options-object change, `role`→`actor` rename, `sheet-db`→`lsdb` CLI/config/token-file
  renames. Verified against live Google Sheets data.
- Built the `/admin` API: `/admin/users` (list, status toggle), `/admin/services`
  (full CRUD + reorder), `/admin/bookings` (cross-user aggregation + the
  confirmed→active→completed transitions the mobile app doesn't expose). Documented in
  `ADMIN_API.md`. Verified end-to-end against live data (create/update/delete, invalid
  transition guard, etc.).
- Built a second, admin-only Google OAuth flow (`/admin/auth/google` →
  `/admin/auth/callback`), `login-only` + role-gated, with its own redirect URI
  separate from the mobile app's customer OAuth flow.
- `seeds/super-admin.ts` to seed a real admin account for local testing/login.

### `admin_portal` (this repo)
- Cloned `shadcn-admin`, git history stripped, de-branded to "Paw Admin".
- Real auth wired to the backend (Clerk and all fake/demo auth removed): email/password
  login, Google OAuth button, session bootstrap via `/user/auth/me`, route guard on
  `_authenticated`.
- Orders (`/admin/bookings`), Content (`/admin/services`), Users (`/admin/users`) pages
  built and wired to live data. Nav trimmed to Dashboard/Orders/Content/Users/Settings;
  Apps/Chats/Tasks/Help Center demo features removed. Dashboard shows real stat cards.
- Sign-in screen redesigned: two-column layout, phone-frame mockup on the left using the
  real app screenshot (`public/images/KokTable.png`), Paw's actual color palette.
- `pnpm lint` / `pnpm build` both pass clean.

### `pet_carrying_app` (mobile)
- No changes made this round — already a working app (auth, services browsing, booking
  flow, history) per its own `CLAUDE.md`. Untouched by the admin-portal work above.

## Remaining / known gaps

### `paw_sheetDB`
- [x] **Merchant Operations (2026-07-21): ran `pnpm db:sync`** — the new
      `quantity`/`daily_capacity` columns on `catalog_items` are now live on
      the real Google Sheet (confirmed via `pnpm db:validate` and a live
      round-trip write/read, see below).
- [x] **Merchant Operations (2026-07-21): live end-to-end verification done.**
      Seeded a scratch merchant/shop/catalog (one `product` with `quantity:2`,
      one `service` with `daily_capacity:1`) directly into the live sheet,
      created real `item_id`-based bookings as an existing test customer
      (`jamie@test.local`) against the running `pnpm dev` server: confirmed
      `shop_id` denormalized onto the booking, `GET /merchant/orders` returned
      it correctly shop-scoped, stock decremented 2→1 on the product booking
      and restocked to 2 on `PATCH /merchant/orders/:id {status:cancelled}`,
      and a second overlapping booking against the `daily_capacity:1` service
      correctly `409`'d ("fully booked"). All scratch data deleted after
      (catalog items via `DELETE /merchant/catalog-items`, user/credentials/
      shop/bookings via a one-off script against `adminContext()`/
      `userContext()`, same pattern as `seeds/*.ts`). Committed in `6d7384f`.
      **Note:** `GET /merchant/orders` against the 3 shared test fixture users
      (`jamie`/`taylor`/`morgan`) returns each booking 3× (once per user
      identity) — expected, not a bug: those 3 test accounts intentionally
      share one physical dev sheet (`DEV_USER_SHEET_ID`, see
      `seeds/test-users.ts`), so fanning out per-user re-reads the same
      underlying rows. Won't happen for real users, who each get their own
      sheet via `createUserSheet()`.
- [x] **External, human-only step:** register `http://localhost:3000/admin/auth/callback`
      (and the production equivalent, when deployed) as an *additional* authorized
      redirect URI on the Google Cloud OAuth client — the admin Google sign-in button
      won't complete a real round-trip until this is done.
- [x] User `status: "inactive"` (settable via `PATCH /admin/users/:id`) now blocks login on
      all three auth paths (email/password, customer Google OAuth, admin Google OAuth).
      Existing JWTs for already-logged-in users are not revoked (stateless JWT, no
      per-request DB check) — see `ADMIN_API.md` for the per-path status codes/behavior.
- [x] Added a test runner (`vitest` + `supertest`, `pnpm test`/`test:watch`) — the repo
      had none at all before. Rather than hitting live Google Sheets from tests (slow,
      needs real credentials, mutates real data), built an in-memory fake implementing
      `longcelot-sheet-db`'s own `DatabaseAdapter`/`TableOperations` interface
      (`src/testUtils/fakeAdapter.ts` — that interface exists in the package specifically
      so a non-Sheets storage engine can back `adapter.table()`, so this isn't reaching
      past the library's design) and swap it in for `src/lib/adapter.ts` via `vi.mock` in
      each test file; a shared `test/helpers/testApp.ts` mounts the real route/
      controller/service/middleware stack (`requireAdmin`/`requireMerchant`, `asyncHandler`,
      `errorHandler`) without the two live-Google-OAuth routers `app.ts` also wires up.
      62 tests across 9 files: users, services, bookings (incl. the cross-user fan-out
      and status-transition guard), shops, merchant-applications (approve/reject +
      re-approve guard), catalog-items (admin cross-shop + merchant shop-scoping,
      including the cross-shop-404 and client-supplied-shop_id-ignored cases), the
      `item_id`-vs-`service_id` booking path, and the merchant apply/invite flow —
      including a regression test for the concurrent-redemption race fixed above
      (verified it actually catches the bug: reverting the mutex made it fail 200/200
      instead of 200/400, then confirmed the fix restores it). `pnpm build` and
      `pnpm test` both pass clean.
- [x] 26 files changed, nothing committed yet — everything above is sitting in the
      working tree.
- [x] **Resend merchant invite email.** `application_id` column added to `shops`
      (`.ref('merchant_applications.application_id')`, set by `approve()`) so a given
      application's shop can be looked up without re-approving (which would've created
      a second `shops` row — `approve()` still isn't idempotent, intentionally, this
      just gives resend a different path). New `revoked_at` column on `merchant_invites`,
      distinct from `used_at`, so a stale emailed link 400s with "no longer valid, check
      your latest email" instead of a misleading "already used."
      `POST /admin/merchant-applications/:id/resend-invite`: `409` if the application
      isn't `approved`, `404` if it has no linked shop, `409` if the shop isn't `pending`
      (`active` = already redeemed, `suspended` = admin already dealt with it another
      way) — otherwise revokes every currently-live invite for that shop and issues +
      emails a fresh one. Rate-limited same tier as `/merchant/invite/:token` (20/15min/IP)
      despite sitting behind `requireAdmin`, since it triggers a real email send and
      credential issuance. Documented in `ADMIN_API.md`.
      **Bug caught by live verification, not by the 68-test suite:** the first version
      filtered live invites via `where: { used_at: '', revoked_at: '' }`, which passed
      every test against the in-memory fake adapter but matched *nothing* against real
      Google Sheets — a blank cell round-trips as `null`, not `''`. Fixed by fetching
      all invites for the shop and filtering with JS truthiness instead (matches the
      pattern already used elsewhere, e.g. `findValidInvite`'s `if (invite.used_at)`).
      Also fixed the fake adapter itself (`src/testUtils/fakeAdapter.ts`) to normalize
      `''` → `null` on write, so this class of bug gets caught by the test suite next
      time instead of only by manual live testing.
- [x] **Found live: `app_lgVM0DcCKa`'s resend-invite 404'd** ("No shop found for this
      application") because its shop was one of **six** duplicate `shops` rows for the
      same applicant, none linked via `application_id` — pre-existing fallout from the
      old "manually reset an application to `pending`, re-approve" workaround for the
      EmailJS failure, before resend-invite existed. Matched each of the 4 real
      applications to its correct (most-recently-created) shop by timestamp and
      backfilled `application_id` on those 4 — safe, additive, no data loss. Left the 2
      genuinely-orphaned duplicate shops/invites untouched per instruction ("the data
      are fine, handle the business logic properly") and fixed the root cause instead
      so it can't recur: `approve()` is now idempotent per `application_id` (reuses an
      existing linked shop instead of creating a second one — revoking its live
      invites and issuing a fresh one, same as a resend) and the whole handler is
      serialized per `application_id` via the same `withLock` mutex pattern used for
      invite redemption, closing the analogous concurrent-double-click/retry race.
      Verified live over real HTTP + real Google Sheets latency (not just the fake
      adapter, which didn't reliably reproduce the concurrent-request race — see the
      honest caveat on that test in `test/admin/merchantApplications.test.ts`):
      re-approving after a manual status reset reuses the same `shop_id` (confirmed
      exactly 1 shop row after), and two genuinely concurrent approve requests against
      a live dev server resolved to exactly one `200` + one `409`, exactly one shop.
      Documented in `ADMIN_API.md`.

### `admin_portal`
- [x] **Merchant Operations (2026-07-21): committed and live-verified.**
      Logged in as the scratch merchant (Playwright against the running
      `pnpm dev` server on :5173 + live backend on :3000): `/my-orders` renders
      the seeded orders correctly (shop-scoped, no admin-only nav visible to
      the merchant role); `/my-catalog`'s new "Stock/Capacity" column shows
      the right value per item; the mutate dialog correctly switches between
      "Stock quantity" (product) and "Daily capacity" (service) based on
      `item_type`. Zero browser console errors throughout. Committed.
- [x] **Correction found during this session's live verification:** the
      "My Orders will look empty until `pet_carrying_app` sends `item_id`"
      note below was stale — Phase 4 (mobile) already shipped and is
      committed in that repo (`AddBookingScreen` sends `item_id`, confirmed
      by reading `pet_booking_model.dart`/`add_booking_screen.dart`). Real
      customer bookings **will** populate `shop_id` and show up in My Orders
      already; nothing further blocks this.
- [ ] No automated tests for the new Orders/Content/Users features (the existing test
      suite covers old template scaffolding, not this work).
- [ ] No production deployment/hosting configured — dev-only right now
      (`VITE_API_BASE_URL` defaults to `localhost:3000`).
- [ ] Generic/default favicon and app icons — not yet swapped for Paw branding.
- [ ] "Terms of Use" / "Privacy Policy" on the sign-in page are placeholder text, not
      linked to real pages.
- [x] Zero commits in this repo since the git history was stripped — everything is
      uncommitted.
- [x] **"Resend invite" row action** on the Merchant Applications table, inside the
      existing row-actions dropdown (not a standalone button) — visible only for
      `approved` rows, separated from Approve/Reject by a divider. Icon: `RefreshCw`
      (lucide-react) — picked over a hand-drawn custom SVG matching the user's mail+
      circular-arrows reference exactly, since at the 16px inline size every other
      dropdown icon (`Eye`/`Check`/`X`) renders at, a literal envelope-plus-arrows
      wouldn't read clearly anyway, and the menu item's own "Resend invite" text label
      already carries the "email" half of the meaning. New
      `merchant-applications-resend-dialog.tsx` (mirrors the approve/reject
      `ConfirmDialog` pattern), new `resendMerchantApplicationInvite()` API wrapper,
      `'resend'` added to the dialog-type union in the provider.
      Verified end-to-end live against the real `paw_sheetDB` endpoint above (not
      mocked): approve → resend → confirmed via direct table reads that the first
      invite's `revoked_at` got set and a fresh third invite was issued after a second
      resend, confirmed the `409` "already activated" guard by flipping a shop to
      `active` and re-testing. **Caught one real bug in the process, not mine to fix
      but worth recording:** an orphaned, no-longer-watched `tsx watch` worker process
      was still bound to port 3000 serving a stale pre-`application_id` build of
      `approve()` — its shop-creation call was missing the new `application_id` field
      entirely, so `resendInvite` 404'd with "No shop found for this application"
      against data created through it. Not an app bug — a leftover local dev-process
      artifact from this session's own process juggling; a clean restart fixed it.

### `pet_carrying_app`
- [ ] iOS has no per-flavor Xcode scheme yet (existing gap, documented in `CLAUDE.md`) —
      iOS builds always use the prod entry-point's baked-in config.
- [ ] Minimal test coverage — only the default `test/widget_test.dart` boilerplate.
- [ ] `CLAUDE.md` has one uncommitted edit pending from earlier `/init` work.

### Cross-cutting / product-wide
- [ ] **No payment processing anywhere in the product.** Bookings track `daily_rate`/
      `total` but there's no real payment gateway — the mobile app's "Payment Methods"
      profile menu item is an explicit "coming soon" stub.
- [ ] **Multi-store/marketplace pivot — scoped, plan below, not started.** Deliberately
      parked until this admin portal ships and stabilizes. See "Planned: Multi-store /
      marketplace pivot" below for the full phased plan.

## Planned: Multi-store / marketplace pivot

Turns the current single-shop product into a marketplace of independently-managed shops.
Sequencing: **starts only after the admin portal above ships and stabilizes** — don't
begin implementation until asked.

Naming: role is **"Merchant"** (shop-owner / service-provider role, distinct from
`user`/`admin`) — already decided, keep this name rather than re-opening it.

### Phase 1 — Backend foundations (`paw_sheetDB`)
- [x] Add `merchant` as a third `role` value alongside `user`/`admin` on the `users` table;
      add `requireMerchant` middleware alongside the existing `requireAuth`/`requireAdmin`.
- [x] New admin-actor `shops` table: `shop_id` (PK), `owner_user_id`, `name`, `status`
      (`pending` / `active` / `suspended`), and basic shop configuration (description,
      logo, contact info, hours).
- [x] New shared **`catalog_items`** admin table (kept separate from the existing
      `services` table rather than generalizing it in place, to avoid touching the
      already-shipped admin portal Content page / mobile `GET /user/services`) with a
      `shop_id` column and an `item_type: 'service' | 'product'` discriminator, since
      shops may sell services or physical goods (e.g. pet accessories). **Isolate by
      `shop_id` in one shared table — do not give each merchant their own Google
      Sheet.** Schema-only for now — no CRUD endpoints against it yet (Phase 2/3 work).
- [x] Decided and implemented how `bookings`/orders reference a `shop_id`/merchant:
      denormalized `shop_id` column on `bookings` (mirrors the existing `service_name`
      denormalization), filterable in `GET /admin/bookings?shop_id=`. Stays empty until
      booking creation targets `catalog_items` instead of `services` (Phase 4).
- [x] Public, unauthenticated `POST /merchant/apply` — the registration form submission,
      no login required.
- [x] Admin review endpoints: `GET /admin/merchant-applications` (list, `?status=`),
      `POST /admin/merchant-applications/:id/approve` (generates invite + triggers email),
      `.../reject`.
- [x] Invite token design: single-use, expiring (7 days), **stored hashed**
      (HMAC-SHA256 with a dedicated `INVITE_TOKEN_SECRET`, never the raw token),
      rate-limited issuance/redemption (`express-rate-limit`: 5/hr/IP on apply,
      20/15min/IP on invite get+accept).
- [x] `GET/POST /merchant/invite/:token` — accept flow: set a password. **Google OAuth
      activation deferred** — the upstream `createAuthRouter` package has no way to carry
      the invite token through the OAuth redirect round-trip (no custom `state` support),
      so it needs a session/cookie mechanism this stateless-JWT codebase doesn't have yet.
      Documented as a known gap in `ADMIN_API.md`.
- [x] EmailJS integration for the invite email (`src/services/email.service.ts`, via the
      EmailJS REST API + built-in `fetch`). Best-effort — a failed/unconfigured send
      doesn't fail the approve request; the link is also console-logged in non-production.
- [x] Updated `ADMIN_API.md` (new Merchant Applications / Shops / public Merchant
      onboarding sections) and `FLUTTER_GUIDE.md` (new `shop_id` field note on
      `BookingModel`) for the new endpoints/shapes.

### Phase 2 — Admin portal (`admin_portal`)
- [x] "Merchant Applications" nav section: review queue, approve/reject actions, detail
      view per application (`src/features/merchant-applications/`). Was originally built
      against a speculative `GET /admin/merchant-applications` shape (the schema file said
      so explicitly) before the backend shipped; the real endpoint uses different field
      names and has no `shop_type`/`reviewed_at`. Fixed the drift: `applicant_email`→
      `contact_email`, `phone`→`contact_phone`, dropped the fabricated `shop_type`
      ("Sells" column/field, never existed on `merchant_applications`), "Submitted" now
      reads the real `_created_at` timestamp instead of a nonexistent `submitted_at`.
      Verified end-to-end against a live `pnpm dev` backend (logged in, seeded pending/
      rejected applications, confirmed list + detail dialog render real data, zero
      console errors) — screenshots not kept, scratch seed data cleaned up after.
- [x] Shop management view: list all shops, view/suspend/reactivate
      (`src/features/shops/`). Same speculative-shape issue: the frontend assumed
      `GET /admin/shops` would denormalize `owner_name`/`owner_email` the way
      `/admin/bookings` does for `user_name`/`user_email` — it doesn't. Replaced the
      "Owner" column/field with the real `owner_user_id` (blank + "Invite not yet
      redeemed" until the shop reaches `active`), and repurposed a "Contact" column for
      the shop's own `contact_email`/`contact_phone`. Verified live the same way as
      Merchant Applications above (pending shop with blank owner, active shop with
      `owner_user_id` populated).
- [ ] Existing Content (`/admin/services`) page becomes shop-aware once catalog items
      carry `shop_id` — decide whether admin's view stays cross-shop (with a shop filter)
      or moves entirely to the merchant-facing surface in Phase 3. Unblocked now that the
      Cross-cutting `catalog_items` CRUD item above has landed; still not started.

### Phase 3 — Merchant-facing web
- [x] Public, no-login registration form page (`/register`,
      `src/features/merchant-register/`) that posts to `POST /merchant/apply`. Built
      inside `admin_portal` rather than a separate app (decided over the alternative of a
      standalone merchant-web project, despite `backend_paw`'s `MERCHANT_FRONTEND_URL`
      env var originally implying a separate app) — repointed that env var
      (`.env`/`.env.example`) from `:5174` to PawAdmin's real dev port `:5173` so the
      invite email link resolves correctly. Dropped the "type — services vs. goods" field
      from the original scope note: `merchant_applications` has no such column on the
      backend, only `shops`/`catalog_items` do, and those are set later (Phase 1's
      `catalog_items.item_type`), not at application time. Linked from the sign-in page
      ("Own a pet business? Apply to become a merchant").
- [x] Invite acceptance page (`/invite/:token`, `src/features/merchant-invite/`): shows
      shop name/description + email from `GET /merchant/invite/:token`, sets a password
      via `POST` the same path. **Password-only, no "Continue with Google"** — matches
      the backend's own documented gap (`ADMIN_API.md` § 4: the upstream
      `createAuthRouter` package can't carry an invite token through the OAuth redirect
      round-trip). **Deliberately does not log the merchant in / navigate into
      `_authenticated`** after a successful accept — shows an inline confirmation instead
      and stops there, since the merchant dashboard below doesn't exist yet and that
      shell would 403 a merchant-role token against admin-only endpoints.
      Verified end-to-end live: seeded a scratch application, approved it through the
      already-built Merchant Applications admin UI to get a real invite token (console-
      logged per `email.service.ts`'s non-production behavior), drove `/invite/:token`
      with it, confirmed the resulting `users`/`credentials`/`shops` rows, zero console
      errors — then deleted all scratch rows/users/invite after.
- [x] Merchant dashboard, scoped to the merchant's own `shop_id`. Built as two coordinated
      workstreams (backend + frontend) against a pre-agreed contract:
      - **Backend:** new `GET/PATCH /merchant/shop` (`src/routes/merchant/shop.routes.ts` +
        controller + `src/services/merchant/shop.service.ts`), scoped to the caller's
        `shop_id` from the JWT via the same `requireShopId` guard `/merchant/catalog-items`
        uses. `PATCH` accepts `name, description, logo, contact_email, contact_phone,
        hours` — `status` is silently ignored (stays admin-only via `/admin/shops/:id`).
        `login()`/`getMe()` in `auth.service.ts` now also put `shop_id` directly on the
        returned `user` object for `role: "merchant"` (previously JWT-only), since the
        frontend never decodes JWTs. 8 new tests, 78/78 passing. Documented in
        `ADMIN_API.md`. Live-verified against real Google Sheets with two scratch
        merchant accounts confirming cross-shop isolation (a body-supplied `shop_id`
        can't leak into another shop's data); scratch data cleaned up after.
      - **Frontend:** `src/features/my-shop/` (view/edit shop config) and
        `src/features/my-catalog/` (full CRUD table for the merchant's own catalog items,
        mirroring `src/features/content/`'s dialog/table/provider split) under new
        `/my-shop` and `/my-catalog` routes. `AuthUser.shop_id` added to the auth store.
        `src/components/layout/data/sidebar-data.ts` is now `getSidebarData(role)` —
        merchants see only My Shop / My Catalog / Settings, no Dashboard (it's built
        entirely from `/admin/*` stats a merchant JWT 403s on) or the admin-only sections.
        New `src/lib/route-guards.ts` (`requireAdminRole`/`requireMerchantRole`) bounces
        each role away from the other's routes instead of hitting a raw 403.
        **Unplanned but required fix caught along the way:** `user-auth-form.tsx` and
        `use-session-bootstrap.ts` both hard-blocked any non-`admin` role at login/session
        restore — a merchant account could never have reached this portal at all before
        this fix (loosened to accept `admin` OR `merchant`). `pnpm lint`/`pnpm build`
        clean. Live-verified full `/merchant/catalog-items` CRUD and `GET/PATCH
        /merchant/shop` against the real backend via a scratch apply→approve→invite→
        accept flow; scratch accounts deactivated after.
      - Found again during this pass: the long-running `pnpm dev` process on port 3000
        was stale (pre-dated these changes) — same class of orphaned-tsx-watch-worker
        issue documented earlier in this file. Restarted it; confirmed `/merchant/shop`
        and `/merchant/catalog-items` both respond correctly (401, not 404) against the
        fresh process. Several other orphaned `tsx watch` processes from earlier sessions
        were left running at the user's request (only the port-3000 one was restarted).

### Phase 4 — Mobile app (`pet_carrying_app`)

**Why a bigger rewrite than it looks:** the current app hard-assumes one shop end to
end — `ServiceController.services` is one global flat list with no `shopId`, tapping a
service on Home (`services_section.dart`) jumps *straight* into `AddBookingScreen` with
no browse/shop-selection step, the amber FAB opens that same booking form completely
blank, and there is **no GetX route table at all** (zero `GetPage`s — every screen is
pushed imperatively via `Get.to(() => Screen())`). None of that holds once a service
name isn't unique to one shop. UX decisions below made 2026-07-15.

Was blocked on Phase 1 (`shop_id`/`item_type` needed to exist in the API and
`FLUTTER_GUIDE.md` first) — unblocked once that landed. Implemented 2026-07-15.

**New flow:**
```
Home (discovery)          Browse                ShopDetail             Booking
┌──────────────────┐     ┌─────────────────┐   ┌──────────────────┐  ┌──────────────────┐
│ search bar        │──┐ │ search + filters │   │ shop header       │  │ pet/date form,    │
│ category chips     │  ├▶│ shop list/grid   │──▶│ (logo/desc/hours) │─▶│ shop+item already  │
│ Popular Shops rail  │  │ (tap → ShopDetail)│   │ catalog: Services │  │ preselected (no    │
│ Near You rail (2)   │  └─────────────────┘   │ / Products tabs   │  │ freeform dropdown) │
└──────────────────┘                            │ (tap item → Book) │  └────────┬───────────┘
     ▲ FAB (search icon) also opens Browse ──────┘                            ▼
     │                                                                Confirmation screen (new)
     └────────────────────────────────────────────────────────────────────────┘
                                                                                 ▼
                                                                    Bookings tab (Upcoming/Past)
```

- [x] **Nav bar restructure** (`app_screen.dart`, `navigation_controller.dart`): merged
      **Stays** and **History** into a single **Bookings** tab (`bookings_screen.dart`)
      with an internal segmented control (Upcoming / Past — `Upcoming` = not `finished`,
      so a just-created `pending` booking shows up immediately, not just
      `confirmed`/`active`). New 4-tab layout: **Home | Browse | Bookings | Profile**.
      Deleted `stays_screen.dart`/`history_screen.dart` and the now-unused
      `GET /user/bookings/active` client path (`GetActiveBookingsUseCase`,
      `BookingRepository.getActiveBookings`, `ApiEndpoints.activeBookings`) along with it.
- [x] **FAB repurposed** (`app_screen.dart`): now opens the new `SearchScreen` via
      `Get.toNamed(AppRoutes.search)` instead of a blank `AddBookingScreen`.
- [x] **New `SearchScreen`**: text search across shops, results list, tap →
      `ShopDetailScreen`. (Catalog-item search deferred — no such endpoint to search
      against yet; see note below.)
- [x] **New `BrowseScreen`** (Browse tab body): search bar + category filter chips +
      shop list. Reached directly from the tab, or from a Home category chip
      (pre-filtered via route argument) or "Popular Shops" "See all →".
- [x] **Home page redesign** (`home_screen.dart`): `HomeHeader` untouched; `StatusCard`
      repurposed into a real "next upcoming booking" preview (derived from
      `BookingController.upcomingBookings`, tapping jumps to the Bookings tab); added a
      search-bar entry point and category quick-filter chips (new `ShopCategories` util,
      mirroring `PetTypes`) that open `BrowseScreen` pre-filtered; replaced the flat
      `ServicesSection` grid with a **"Popular Shops"** horizontal rail
      (`popular_shops_section.dart`). **"Near You" rail left out entirely**, as specified
      (needs lat/lng + location permission groundwork that doesn't exist yet).
- [x] **New `ShopDetailScreen`**: shop header (description/hours/contact) + catalog tabbed
      by `item_type` (Services / Products). Tapping a catalog item opens `AddBookingScreen`
      with shop + item already known.
- [x] **`AddBookingScreen` rework**: now requires `Shop`+`CatalogItem` (both non-nullable
      constructor params); the service dropdown is gone entirely, replaced by a shop/item
      summary header. Only reachable from `ShopDetailScreen` now.
- [x] **New booking confirmation screen** (`booking_confirmation_screen.dart`): shows
      pet/shop/service/dates/total, "View My Bookings" lands on the Bookings tab
      (Upcoming segment).
- [x] **Introduced a GetX named route table** (`presentation/routes/app_routes.dart` +
      `app_pages.dart`, wired via `GetMaterialApp(getPages:)` in `main.dart`) covering the
      new deep flow: Search/Browse/ShopDetail/Booking/BookingConfirmation, with typed
      `Get.arguments` (including a Dart record for the two 2-arg routes). Pre-existing
      screens outside this flow (Profile, PetDetail, Login/Register) were left on
      imperative `Get.to()` — out of scope, not part of the new deep chain.
- [x] **New `Shop` entity/model/repository/datasource/usecase**, mirroring the old
      `Service` structure. Local mock fallback seeded with 4 shops (`shop_local_datasource.dart`)
      since there's still no public shop-listing endpoint (see note below) — added a
      `category` field on `Shop` (not on the backend `shops` schema yet) so Home/Browse
      chips can filter shop cards directly, mirroring how `category` worked on `Service`.
- [x] Replaced `Service` with a new **`CatalogItem`** entity/model/repo/datasource/usecase
      (`shopId` + `itemType: 'service' | 'product'`, mirrors the backend `catalog_items`
      schema exactly). `Service` and everything under it (`ServiceController`,
      `ServicesSection`, `/user/services` client calls) were fully deleted — the old flat
      single-shop browsing UI has no callers left post-rewrite.
- [x] `PetBooking`/`PetBookingModel` carry `shopId` (parsed from the response's `shop_id`).
      Create requests now send `item_id` instead of `service_id` (mutually exclusive per
      the updated `FLUTTER_GUIDE.md` § Bookings) — `shop_id` is **not** sent on create,
      the backend derives it server-side from `item_id`.
- [x] Surfaced shop branding (name) on `BookingCard` and `PetDetailScreen`, resolved via
      `ShopController.shopById()`.

  **Still open / not built this pass:**
  - No public, unauthenticated endpoint to list shops or a shop's catalog items exists
    yet (only `/admin/catalog-items` and `/merchant/catalog-items`, both role-gated) — the
    app's `ShopRemoteDataSource`/`CatalogRemoteDataSource` call assumed REST endpoints
    (`GET /user/shops`, `GET /user/shops/:id/catalog-items`) that currently 404 and fall
    back to local mock data every time, same resilience pattern as bookings/services.
    Swaps to live data automatically once those routes exist — no app-side work needed,
    but someone needs to add them (and settle on the exact shape) before this is real.
  - Catalog-item search on `SearchScreen`/`BrowseScreen` is shop-name-only for the same
    reason — no item-search endpoint to query.

### Cross-cutting
- [x] Finalized the bookings/orders ↔ `shop_id` association model. Closed the loop left
      open in Phase 1: added `catalog_items` CRUD — `/admin/catalog-items` (cross-shop,
      admin-only) and `/merchant/catalog-items` (authenticated, `requireMerchant`, always
      scoped to the caller's own `shop_id` from the JWT, never a client-supplied one) —
      and `POST /user/bookings` now accepts `item_id` as an alternative to `service_id`
      (exactly one required), denormalizing the catalog item's `shop_id`/`name` onto the
      booking. Along the way, dropped the `.ref('services.service_id')` FK annotation on
      `bookings.service_id`, since `longcelot-sheet-db` enforces `.ref()` at write time
      and that column now also carries `catalog_items.item_id` values for the new path —
      the old annotation was rejecting legitimate writes as FK violations. Verified
      end-to-end against live data (admin CRUD, merchant shop-scoping incl. cross-shop
      404 and non-merchant 403, item_id booking populating shop_id, mutual-exclusivity
      validation, admin `?shop_id=` filter). Updated `ADMIN_API.md` (new Catalog Items
      section) and `FLUTTER_GUIDE.md`. The mobile app doesn't send `item_id` yet — that's
      still Phase 4 (shop browsing UI) — but the API is ready ahead of that client work.
- [x] Full security pass on the invite-link flow. Token hashing (HMAC-SHA256, dedicated
      secret), expiry (7d), and rate limiting (`express-rate-limit`, documented
      single-process caveat) were already solid — reviewed and left as-is. Found and
      fixed one real gap: **single-use enforcement had a TOCTOU race** — two concurrent
      `POST /merchant/invite/:token` requests for the same token could both pass the
      "not yet used" check before either wrote, each creating its own merchant account.
      Fixed with a per-token in-process mutex (`src/lib/mutex.ts`) wrapping the whole
      accept handler, plus reordered to mark the invite used *before* creating the
      account (fails closed on partial failure). Also added startup validation
      (`src/config/env.ts`) rejecting `JWT_SECRET`/`INVITE_TOKEN_SECRET` that are too
      short or still equal the literal `.env.example` placeholder. Verified live: fired
      two concurrent accept requests at one token — exactly one 200, one 400, exactly
      one `users` row created; confirmed a short/placeholder secret now fails to boot.
      Documented in `ADMIN_API.md`.
