import { z } from 'zod'

// Matches the `CatalogItem` object documented in ADMIN_API.md § 6, scoped
// client-side to `item_type: 'product'` rows only — merchandise, ingredients,
// and any other physical item a restaurant sells. See My Catalog's `data/schema.ts`
// for the services-only counterpart over the same underlying table.
const _productSchema = z.object({
  item_id: z.string(),
  restaurant_id: z.string(),
  item_type: z.literal('product'),
  name: z.string(),
  description: z.string().optional().default(''),
  price_from: z.number(),
  image: z.string().optional().default(''),
  category_id: z.string().optional().default(''),
  active: z.boolean(),
  sort_order: z.number(),
  // Optional — absent/undefined means "unlimited" stock.
  quantity: z.number().optional(),
})
export type Product = z.infer<typeof _productSchema>

export const productsListResponseSchema = z.object({
  items: z.array(_productSchema),
})
