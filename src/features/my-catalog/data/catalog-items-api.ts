import { apiClient } from '@/lib/api-client'
import { type CatalogItem } from './schema'

export type CatalogItemFilters = {
  active?: boolean
}

// `/merchant/catalog-items?item_type=service` (ADMIN_API.md § 6) — this
// feature now only manages services; physical products live in My Products
// (`src/features/my-products/`), scoped to `item_type: 'product'` over the
// same underlying table. Always scoped server-side to the caller's own restaurant
// from the JWT — never send a `restaurant_id` here.
export function fetchCatalogItems(filters: CatalogItemFilters = {}) {
  return apiClient.get<{ items: CatalogItem[] }>('/merchant/catalog-items', {
    item_type: 'service',
    active: filters.active,
  })
}

export type CatalogItemPayload = {
  name: string
  description?: string
  price_from: number
  icon?: string
  color?: string
  category_id?: string
  active?: boolean
  sort_order?: number
  daily_capacity?: number
}

export function createCatalogItem(payload: CatalogItemPayload) {
  return apiClient.post<{ item: CatalogItem }>(
    '/merchant/catalog-items',
    payload
  )
}

export function updateCatalogItem(
  itemId: string,
  payload: Partial<CatalogItemPayload>
) {
  return apiClient.patch<{ item: CatalogItem }>(
    `/merchant/catalog-items/${itemId}`,
    payload
  )
}

export function deleteCatalogItem(itemId: string) {
  return apiClient.delete<void>(`/merchant/catalog-items/${itemId}`)
}
