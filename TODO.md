# Portal TODO — restaurant schema redesign follow-up

Backend split `restaurants` into `restaurants` (brand) + `restaurant_locations` (site,
many-to-one) + `restaurant_cuisines`/`cuisines` (many-to-many) + `restaurant_hours`
(per-day), and added (schema-only, unused) `floors` → `rooms` → `tables` for future
table-level booking. This tracks what Portal work that leaves open.

## Already done (this session)

- [x] Admin `restaurants` feature: `locations[]` / `cuisines[]` / `hours[]` read from the
      new embedded shape (`restaurants-columns.tsx`, `-table.tsx`, `-detail-dialog.tsx`)
- [x] Merchant `my-restaurant` feature: `location` (singular) / `cuisines` / `hours`
      wired; `RestaurantHoursDialog` and `RestaurantLocationDialog` built and hooked into
      the profile preview's menu
- [x] Shared `restaurants/data/hours-schema.ts` and `location-schema.ts`, reused by both
      features

## 1. Cuisines admin management

Backend (`cuisines` table, `categories`-shaped) is ready; nothing manages it yet.

- [ ] New `cuisines` feature mirroring `categories/` (list/create/edit/deactivate) —
      copy `categories-{columns,table,mutate-dialog,delete-dialog,provider,primary-buttons}`
- [ ] Add to admin sidebar (`sidebar-data.ts`), probably next to Categories
- [ ] `cuisines-api.ts` — no backend routes exist for this yet either; needs
      `/admin/cuisines` CRUD added to Backend first (mirrors `categories.routes.ts`)

## 2. Merchant cuisine picker

`restaurantCuisines.service.ts`'s `setForRestaurant()` is fully built and already used by
the seed data — nothing merchant-facing calls it. Right now a merchant can see their
restaurant's cuisines (read-only) but never set them.

- [ ] Multi-select in `RestaurantEditDialog` (or its own small dialog, matching the
      hours/location pattern) sourced from `GET /admin/cuisines` (needs read access opened
      to merchants, or a public `GET /cuisines` mirror — check with Backend on which)
- [ ] Wire to a new `PUT /merchant/restaurant/cuisines` (thin wrapper around
      `restaurantCuisines.service.setForRestaurant`, same shape as the hours endpoint)

## 3. Multi-location management (the actual point of the location split)

Right now a merchant can only edit their one auto-created "primary" location — there's no
way for anyone to add a second branch. Backend work needed before Portal work:

- [ ] Backend: admin `restaurant_locations` CRUD (`/admin/restaurants/:id/locations`) —
      `restaurantLocations.service.ts` already has `create`/`update`, just needs routes
- [ ] Backend: decide whether merchants can add their own additional locations, or if
      that stays admin-only
- [ ] Portal (admin): a "Locations" list within the restaurant detail view — add/edit/
      deactivate a branch, not just the single read-only location shown today

## 4. Floors / Rooms / Tables — full stack, biggest item

Schema exists (`floors.ts`, `rooms.ts`, `tables.ts`, keyed to `location_id`); zero
services, routes, or Portal UI. This was deliberately deferred to schema-only earlier.

- [ ] Backend: `restaurantFloors.service.ts` / `restaurantRooms.service.ts` /
      `restaurantTables.service.ts` (CRUD, location-scoped)
- [ ] Backend: admin + merchant routes, same dual-router pattern as `catalog-items`
      (`/admin/floors`, `/merchant/floors`, etc., or nested under a location)
- [ ] Portal (merchant): floor plan management — start as a plain list-based CRUD
      (floors → rooms per floor → tables per room, seats/shape), same pattern as
      `my-catalog`. A drag-and-drop canvas using `position_x`/`position_y` is a v2, not
      needed to unblock table-based booking
- [ ] Portal (admin): read-only visibility into a restaurant's floor/room/table setup is
      probably enough — no admin edit needed

## Related backend debt (not Portal work, but worth doing before more location-aware UI)

- [ ] `restaurant_hours` is still keyed to `restaurant_id`, not `location_id` — flagged,
      unfixed. Doing this before #3/#4 land avoids re-plumbing the hours UI twice.

## Suggested order

1. Cuisines admin management + merchant picker (small, backend mostly ready already)
2. `restaurant_hours` → `location_id` fix (backend-only)
3. Admin multi-location CRUD (unlocks the actual "chains/branches" use case)
4. Floors/rooms/tables backend
5. Floors/rooms/tables Portal UI
