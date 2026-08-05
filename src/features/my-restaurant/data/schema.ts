import { z } from 'zod'
import { dayHoursSchema } from '@/features/restaurants/data/hours-schema'
import { locationSchema } from '@/features/restaurants/data/location-schema'

const restaurantStatusSchema = z.union([
  z.literal('pending'),
  z.literal('active'),
  z.literal('suspended'),
])
export type RestaurantStatus = z.infer<typeof restaurantStatusSchema>

// Matches the `Restaurant` object documented in ADMIN_API.md § 5 — the same shape
// `/admin/restaurants` returns, just fetched/edited via the merchant-scoped
// `GET/PATCH /merchant/restaurant` instead (always the caller's own restaurant, no
// `restaurant_id` ever sent in the request). `status` is read-only here — only an
// admin can change it (`PATCH /admin/restaurants/:id`). Unlike the admin endpoint's
// `locations` array, this embeds a single `location` — the merchant self-service flow
// doesn't manage more than one location yet (see ADMIN_API.md's "Merchant restaurant
// profile" section).
const _restaurantSchema = z.object({
  restaurant_id: z.string(),
  application_id: z.string().optional(),
  owner_user_id: z.string(),
  category_id: z.string().optional().default(''),
  name: z.string(),
  description: z.string().optional().default(''),
  logo: z.string().optional().default(''),
  banner: z.string().optional().default(''),
  location: locationSchema.nullable().optional(),
  cuisines: z.array(z.string()).optional().default([]),
  hours: z.array(dayHoursSchema).optional().default([]),
  status: restaurantStatusSchema,
})
export type Restaurant = z.infer<typeof _restaurantSchema>

export const restaurantResponseSchema = z.object({
  restaurant: _restaurantSchema,
})
export type RestaurantResponse = z.infer<typeof restaurantResponseSchema>
