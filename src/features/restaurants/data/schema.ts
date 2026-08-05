import { z } from 'zod'

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
const _restaurantSchema = z.object({
  restaurant_id: z.string(),
  owner_user_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  logo: z.string().optional(),
  contact_email: z.string().optional(),
  contact_phone: z.string().optional(),
  hours: z.string().optional(),
  status: restaurantStatusSchema,
  // Directory-import fields — populated for restaurants bulk-seeded from an external
  // directory (see Backend/seeds/restaurants.ts), blank for merchant-onboarded ones
  // unless backfilled. See ADMIN_API.md § 5.
  address: z.string().optional(),
  city: z.string().optional(),
  cuisine: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  rating: z.number().optional(),
  rating_count: z.number().optional(),
  price_level: z.number().optional(),
  price_symbol: z.string().optional(),
  opening_hours: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  google_place_id: z.string().optional(),
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
