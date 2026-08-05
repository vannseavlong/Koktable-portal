import { apiClient } from '@/lib/api-client'
import { type Category } from './schema'

export type CategoryFilters = {
  active?: boolean
}

export function fetchCategories(filters: CategoryFilters = {}) {
  return apiClient.get<{ categories: Category[] }>('/admin/categories', {
    active: filters.active,
  })
}

// Public, unauthenticated read used by the merchant-facing dropdowns (My
// Catalog/My Products/My Restaurant) — merchants can't hit /admin/categories (403).
// Returns only active categories, already sorted by sort_order.
export function fetchPublicCategories() {
  return apiClient.get<{ categories: Category[] }>('/user/categories')
}

export type CategoryPayload = {
  name: string
  icon?: string
  active?: boolean
  sort_order?: number
}

export function createCategory(payload: CategoryPayload) {
  return apiClient.post<{ category: Category }>('/admin/categories', payload)
}

export function updateCategory(
  categoryId: string,
  payload: Partial<CategoryPayload>
) {
  return apiClient.patch<{ category: Category }>(
    `/admin/categories/${categoryId}`,
    payload
  )
}

export function deleteCategory(categoryId: string) {
  return apiClient.delete<void>(`/admin/categories/${categoryId}`)
}

export function reorderCategories(order: string[]) {
  return apiClient.patch<{ categories: Category[] }>(
    '/admin/categories/reorder',
    { order }
  )
}
