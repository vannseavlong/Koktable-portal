# Merchant Portal Feature: Shop Profile Preview + My Products

Implementation checklist for two merchant-portal improvements. See the design
rationale in the approved plan (context recap below); this file tracks execution
status. Spans two repos: `paw_sheetDB` (backend) and `admin_portal` (this repo).

## Context

1. **My Shop**: turn the always-editable form into a read-only storefront preview
   (banner + logo images, name, status, description, contact, hours) with an
   explicit **Edit** button that opens the form in a dialog. Logo/banner become
   real image uploads instead of URL text fields.
2. **My Products** (new tab): merchants manage physical inventory (pets,
   accessories, feed, other items) with an image + quantity + stock management.
   Backed by the existing `catalog_items` table, scoped to `item_type: 'product'`.
   **My Catalog becomes services-only** as a result — no data migration, old
   product rows just start showing up in My Products instead.

Image storage: `longcelot-sheet-db`'s built-in `DriveStorageAdapter` (currently
unused), wired up with `multer` for multipart parsing. One shared upload
mechanism backs both My Shop images and Product images.

Out of scope: `pet_carrying_app` (Flutter) rendering these images in customer
store browsing; broadening the `item_type` enum; admin-side (`/admin/*`) UI.

---

## Backend (`paw_sheetDB`)

### Shared image upload infra
- [x] Add `multer` + `@types/multer` deps
- [x] `src/lib/adapter.ts`: configure `DriveStorageAdapter` on `createSheetAdapter`
- [x] `src/middleware/upload.ts`: multer memory storage + image mimetype filter
- [x] `src/utils/imageUpload.ts`: `uploadImage()` / `deleteImageBestEffort()`
- [x] `src/testUtils/fakeAdapter.ts`: export fake `adapter.upload`/`deleteFile`

### Shop: `banner` field + upload wiring
- [x] `schemas/admin/shops.ts`: add `banner` column
- [x] `src/services/merchant/shop.service.ts`: `UpdateShopInput.banner` + whitelist
- [x] `src/controllers/merchant/shop.controller.ts`: handle `req.files.logo/banner`
- [x] `src/routes/merchant/shop.routes.ts`: `upload.fields([logo, banner])` on PATCH
- [x] `ADMIN_API.md` §5: document `banner` + multipart contract

### Catalog items: `image` field + upload wiring
- [x] `schemas/admin/catalog_items.ts`: add `image` column
- [x] `src/utils/catalogItems.ts`: `image` in `CatalogItemInput`/`catalogItemUpdateData`
- [x] `src/services/merchant/catalogItems.service.ts`: image on create + delete-on-remove
- [x] `src/controllers/merchant/catalogItems.controller.ts`: handle `req.file`
- [x] `src/routes/merchant/catalogItems.routes.ts`: `upload.single('image')` on POST/PATCH
- [x] `ADMIN_API.md` §6: document `image` + multipart contract

### Tests
- [x] Extend merchant shop/catalog-items tests: banner/image pass-through, upload
      via faked adapter, best-effort delete doesn't throw
- [x] `pnpm build && pnpm test` passes clean (105/105)

### Gated — needs explicit user go-ahead, do not run automatically
- [ ] `pnpm db:sync` to push `banner`/`image` columns to the live Google Sheet
- [ ] Confirm a real upload against live Drive succeeds (OAuth scope check)

---

## Frontend (`admin_portal`)

### `apiClient` multipart support
- [x] `src/lib/api-client.ts`: FormData-aware path (no forced JSON content-type)

### My Shop → preview + Edit dialog
- [x] `data/schema.ts`: add `banner`
- [x] `data/shop-api.ts`: `updateMyShop` sends `FormData`
- [x] New `components/shop-profile-preview.tsx`
- [x] New `components/shop-edit-dialog.tsx`
- [x] Delete `components/my-shop-form.tsx`; rewire `index.tsx`

### New "My Products" feature
- [x] `src/features/my-products/data/schema.ts`
- [x] `src/features/my-products/data/products-api.ts`
- [x] `components/products-mutate-dialog.tsx`
- [x] `components/products-columns.tsx`
- [x] `components/products-provider.tsx`
- [x] `components/products-dialogs.tsx`
- [x] `components/products-delete-dialog.tsx`
- [x] `components/data-table-row-actions.tsx`
- [x] `components/products-table.tsx`
- [x] `components/products-primary-buttons.tsx`
- [x] `index.tsx`
- [x] Route `src/routes/_authenticated/my-products/index.tsx`

### My Catalog → services-only
- [x] `data/catalog-items-api.ts`: hardcode `item_type: 'service'`
- [x] `components/catalog-items-mutate-dialog.tsx`: drop item_type select + quantity
- [x] `components/catalog-items-columns.tsx`/table/route: drop item_type facet
- [x] Update page copy for services-only framing

### Sidebar
- [x] `src/components/layout/data/sidebar-data.ts`: add "My Products" nav entry

### Checks
- [x] `pnpm build && pnpm lint` passes clean

### Fix: uploaded images not rendering (post-launch)
- [x] Root cause: Drive's `uc?id=` URL (what `adapter.upload()` returns and what's
      stored) serves with `Content-Disposition: attachment`, so `<img>` shows
      broken instead of rendering.
- [x] `src/lib/drive-image.ts`: `toDisplayImageUrl()` — extracts the Drive file ID
      and rewrites to the `thumbnail?id=...&sz=w1000` endpoint (inline image
      Content-Type) at render time only; the original `uc?id=` URL keeps being
      stored/deleted unchanged (that's the format `adapter.deleteFile()` expects).
- [x] Applied at every render site: `shop-profile-preview.tsx` (banner, logo),
      `shop-edit-dialog.tsx` (edit preview), `products-mutate-dialog.tsx` (edit
      preview), `products-columns.tsx` (table thumbnail).
- [x] `pnpm build && pnpm lint` re-verified clean.

### Fix: banner not persisting
- [x] Root cause: `banner`/`image` were brand-new schema columns never pushed to
      the live Google Sheet (`pnpm db:sync` was gated pending go-ahead) — `logo`
      is an old, already-synced column, so it saved fine while `banner` silently
      didn't. Ran `pnpm db:sync` (user-approved): 10 synced, 0 failed.
- [ ] User to re-upload/confirm banner now persists and renders.

### My Shop actions → dropdown menu
- [x] `shop-profile-preview.tsx`: replaced the standalone "Edit" button with a
      shadcn `DropdownMenu` (icon trigger) containing an "Edit" item — built to
      have more actions (e.g. close/open store) added later; scope for those was
      deferred, not designed yet.

---

## Verification
- [x] `paw_sheetDB`: `pnpm build && pnpm test` (105/105 passing)
- [x] `admin_portal`: `pnpm build && pnpm lint` (clean; pre-existing
      `__root.tsx` fast-refresh warning is unrelated)
- [ ] Manual click-through (after gated `db:sync` go-ahead): shop logo/banner
      upload updates preview; add product with image+quantity shows in My
      Products; My Catalog lists services only; toggle/delete a product works
      — **not yet done**, needs a live backend + `db:sync` go-ahead first
