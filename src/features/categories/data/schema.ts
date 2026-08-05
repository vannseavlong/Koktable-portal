import { z } from 'zod'

// Matches the `Category` object documented in ADMIN_API.md § 8 — the shared
// taxonomy referenced by `category_id` on restaurants/catalog_items/services.
const _categorySchema = z.object({
  category_id: z.string(),
  name: z.string(),
  icon: z.string().optional().default(''),
  active: z.boolean(),
  sort_order: z.number(),
})
export type Category = z.infer<typeof _categorySchema>

export const categoriesListResponseSchema = z.object({
  categories: z.array(_categorySchema),
})
