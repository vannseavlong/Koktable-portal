import { z } from 'zod'

// Matches the `Cuisine` object documented in ADMIN_API.md — the canonical
// cuisine vocabulary referenced by `restaurant_cuisines` (many-to-many with
// restaurants). Mirrors `Category`'s shape exactly.
const _cuisineSchema = z.object({
  cuisine_id: z.string(),
  name: z.string(),
  icon: z.string().optional().default(''),
  active: z.boolean(),
  sort_order: z.number(),
})
export type Cuisine = z.infer<typeof _cuisineSchema>

export const cuisinesListResponseSchema = z.object({
  cuisines: z.array(_cuisineSchema),
})
