import { z } from 'zod'

// Matches `restaurant_locations` (Backend/schemas/admin/restaurant_locations.ts) — a
// restaurant can have more than one (chain/branches), embedded as `locations: Location[]`
// on the `Restaurant` object (ADMIN_API.md § 5). `/merchant/restaurant` embeds a single
// primary `location` instead — see that endpoint's docs.
export const locationSchema = z.object({
  location_id: z.string(),
  restaurant_id: z.string(),
  name: z.string().optional(),
  contact_email: z.string().optional(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  rating: z.number().optional(),
  rating_count: z.number().optional(),
  price_level: z.number().optional(),
  price_symbol: z.string().optional(),
  images: z.array(z.string()).optional(),
  google_place_id: z.string().optional(),
})
export type Location = z.infer<typeof locationSchema>

// Helper for views that only show one location per restaurant (admin list/detail —
// full multi-location management isn't built yet, see restaurant_locations.ts's history).
export function primaryLocation(locations: Location[] | undefined): Location | undefined {
  return locations?.[0]
}
