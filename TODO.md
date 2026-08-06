# Portal TODO — restaurant schema redesign follow-up

Backend split `restaurants` into `restaurants` (brand) + `restaurant_locations` (site,
many-to-one) + `restaurant_cuisines`/`cuisines` (many-to-many) + `restaurant_hours`
(per-location, per-day), and added (schema-only, unused) `floors` → `rooms` → `tables`
for future table-level booking. This tracks what Portal work that leaves open.

## Already done

- [x] Admin `restaurants` feature: `locations[]` / `cuisines[]` / `hours[]` read from the
      new embedded shape (`restaurants-columns.tsx`, `-table.tsx`, `-detail-dialog.tsx`)
- [x] Merchant `my-restaurant` feature: `location` (singular) / `cuisines` / `hours`
      wired; `RestaurantHoursDialog` and `RestaurantLocationDialog` built and hooked into
      the profile preview's menu
- [x] Shared `restaurants/data/hours-schema.ts` and `location-schema.ts`, reused by both
      features
- [x] **Cuisines admin management** — new `cuisines` feature (list/create/edit/reorder,
      mirroring `categories/`), sidebar entry added, `/admin/cuisines` CRUD on Backend
- [x] **Merchant cuisine picker** — `use-cuisines` hook + `restaurant-cuisines-dialog`
      wired into My Restaurant's profile menu, backed by `PUT /merchant/restaurant/cuisines`
- [x] **Admin multi-location CRUD** — `restaurant-locations-dialog` +
      `restaurant-location-mutate-dialog` off the admin Restaurants table (add/edit/
      deactivate a branch), backed by `/admin/restaurants/:id/locations`
- [x] **`restaurant_hours` re-keyed to `location_id`** (Backend) — Portal's restaurant
      detail dialog now shows a locations summary instead of a single-location block
- [x] **Portal (merchant) floor plan UI — built against mock data** — new `my-floor-plan`
      feature: three-column master-detail (`floors-panel` → `rooms-panel` →
      `tables-panel`), each list-based CRUD (add/edit/deactivate) matching the
      `restaurant-locations-dialog` pattern, plus mutate dialogs for each entity.
      `data/floor-plan-api.ts` fakes the CRUD against an in-memory store (seeded,
      simulated latency) since no backend routes exist yet — function names/shapes
      mirror what the real `apiClient` module should look like, so swapping it over
      later shouldn't require component changes. Page shows an explicit "running on
      preview data" banner. Sidebar entry added under merchant nav ("Floor Plan").
- [x] **Portal (admin) floor plan read-only view — built against mock data** — new
      `restaurant-floor-plan-dialog.tsx`, opened via a "Floor plan" row action on the
      admin Restaurants table (`restaurants-provider`/`-dialogs` gained a `'floor-plan'`
      dialog type). Nested `Collapsible` tree (floor → rooms → tables), no edit/deactivate
      — read-only per the original scope. Reads through the same
      `my-floor-plan/data/floor-plan-api` mock module the merchant page uses (cross-feature
      import, same convention as `my-restaurant` reusing `restaurants/data/*`); since
      that mock only knows one seeded restaurant, it shows the same preview data
      regardless of which restaurant row it's opened from — flagged with its own
      "preview data" banner in the dialog.

All Portal UI for floors/rooms/tables (item 1, both merchant and admin) is now built.
Everything below is backend-only.

## 1. Floors / Rooms / Tables backend — last piece to unblock the real API

Schema exists (`floors.ts`, `rooms.ts`, `tables.ts`, keyed to `location_id`); zero
services or routes. Portal UI (merchant CRUD + admin read-only) is built and reviewable
now (see above) but running on mock data until this lands.

- [ ] Backend: `restaurantFloors.service.ts` / `restaurantRooms.service.ts` /
      `restaurantTables.service.ts` (CRUD, location-scoped)
- [ ] Backend: admin + merchant routes, same dual-router pattern as `catalog-items`
      (`/admin/floors`, `/merchant/floors`, etc., or nested under a location) — Portal's
      mock module assumes `fetchFloors()`, `fetchRooms(floorId)`, `fetchTables(roomId)`
      plus per-entity create/update, all scoped server-side to the caller's own
      restaurant/location like `my-catalog`; the admin read path additionally needs a
      `restaurant_id`-scoped variant (`fetchFloors()` today ignores which restaurant the
      dialog was opened from — see note above)
- [ ] Portal: once routes exist, replace `my-floor-plan/data/floor-plan-api.ts`'s mock
      bodies with real `apiClient` calls, drop the "preview data" banners in both
      `my-floor-plan/index.tsx` and `restaurant-floor-plan-dialog.tsx`, and thread a real
      `restaurant_id` through the admin dialog's queries
- [ ] Drag-and-drop canvas using `position_x`/`position_y` is a v2, not needed to unblock
      table-based booking

## Suggested order

1. Floors/rooms/tables backend (services + routes)
2. Swap Portal's mock `floor-plan-api.ts` for the real API (merchant + admin)
