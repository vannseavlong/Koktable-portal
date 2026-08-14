import { z } from 'zod'
import { locationSchema } from './location-schema'

const restaurantStatusSchema = z.union([
  z.literal('pending'),
  z.literal('unclaimed'),
  z.literal('active'),
  z.literal('suspended'),
])
export type RestaurantStatus = z.infer<typeof restaurantStatusSchema>

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
export type RestaurantsListResponse = z.infer<
  typeof restaurantsListResponseSchema
>

// Admin can only suspend an active restaurant or reactivate a suspended one —
// `pending` restaurants are waiting on the merchant to accept their invite and
// aren't a state an admin transitions manually.
export const nextStatusOptions: Record<RestaurantStatus, RestaurantStatus[]> = {
  pending: [],
  unclaimed: [],
  active: ['suspended'],
  suspended: ['active'],
}
