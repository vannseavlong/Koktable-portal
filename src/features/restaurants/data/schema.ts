import { z } from 'zod'
import { locationSchema } from './location-schema'

const restaurantStatusSchema = z.union([
  z.literal('pending'),
  z.literal('active'),
  z.literal('suspended'),
])
export type RestaurantStatus = z.infer<typeof restaurantStatusSchema>

// Matches `schemas/admin/restaurants.ts` / `GET /admin/restaurants` in paw_sheetDB (see
// ADMIN_API.md § 5). `owner_user_id` is blank until the restaurant reaches `active`
// (the merchant redeemed their invite) — there is no owner-name/email
// denormalization on this endpoint, unlike `/admin/reservations`'s user_name/user_email.
// `restaurants` holds only brand-level fields — physical-site facts (address, contact,
// rating/price/photos) live on `locations` (a restaurant can have more than one, see
// location-schema.ts); `cuisines` is similarly embedded from its own table. `hours` is
// NOT embedded here — `restaurant_hours` is keyed to `location_id`, so each entry in
// `locations` carries its own `hours` (see location-schema.ts).
const _restaurantSchema = z.object({
  restaurant_id: z.string(),
  owner_user_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  status: restaurantStatusSchema,
  locations: z.array(locationSchema).optional(),
  cuisines: z.array(z.string()).optional(),
})
export type Restaurant = z.infer<typeof _restaurantSchema>

export const restaurantsListResponseSchema = z.object({
  restaurants: z.array(_restaurantSchema),
})
export type RestaurantsListResponse = z.infer<typeof restaurantsListResponseSchema>

// Admin can only suspend an active restaurant or reactivate a suspended one —
// `pending` restaurants are waiting on the merchant to accept their invite and
// aren't a state an admin transitions manually.
export const nextStatusOptions: Record<RestaurantStatus, RestaurantStatus[]> = {
  pending: [],
  active: ['suspended'],
  suspended: ['active'],
}
