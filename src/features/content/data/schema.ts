import { z } from 'zod'

// Matches the `Service` object documented in ADMIN_API.md
// (`/admin/services`) — the restaurant service catalogue shown in the mobile app.
const _serviceSchema = z.object({
  service_id: z.string(),
  name: z.string(),
  description: z.string().optional().default(''),
  price_from: z.number(),
  icon: z.string(),
  color: z.string(),
  category_id: z.string(),
  active: z.boolean(),
  sort_order: z.number(),
})
export type Service = z.infer<typeof _serviceSchema>

export const servicesListResponseSchema = z.object({
  services: z.array(_serviceSchema),
})
