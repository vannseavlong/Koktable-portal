import { apiClient } from '@/lib/api-client'
import { type Cuisine } from './schema'

export type CuisineFilters = {
  active?: boolean
}

export function fetchCuisines(filters: CuisineFilters = {}) {
  return apiClient.get<{ cuisines: Cuisine[] }>('/admin/cuisines', {
    active: filters.active,
  })
}

// Public, unauthenticated read used by the merchant-facing dropdowns (My
// Restaurant) — merchants can't hit /admin/cuisines (403). Returns only
// active cuisines, already sorted by sort_order.
export function fetchPublicCuisines() {
  return apiClient.get<{ cuisines: Cuisine[] }>('/user/cuisines')
}

export type CuisinePayload = {
  name: string
  icon?: string
  active?: boolean
  sort_order?: number
}

export function createCuisine(payload: CuisinePayload) {
  return apiClient.post<{ cuisine: Cuisine }>('/admin/cuisines', payload)
}

export function updateCuisine(
  cuisineId: string,
  payload: Partial<CuisinePayload>
) {
  return apiClient.patch<{ cuisine: Cuisine }>(
    `/admin/cuisines/${cuisineId}`,
    payload
  )
}

export function deleteCuisine(cuisineId: string) {
  return apiClient.delete<void>(`/admin/cuisines/${cuisineId}`)
}

export function reorderCuisines(order: string[]) {
  return apiClient.patch<{ cuisines: Cuisine[] }>('/admin/cuisines/reorder', {
    order,
  })
}
