import { apiClient } from '@/lib/api-client'
import { type Restaurant, type RestaurantStatus, type RestaurantsListResponse } from './schema'

export type RestaurantFilters = {
  status?: RestaurantStatus
  search?: string
  limit?: number
  offset?: number
}

export function fetchRestaurants(filters: RestaurantFilters = {}) {
  return apiClient.get<RestaurantsListResponse>('/admin/restaurants', {
    status: filters.status,
    search: filters.search,
    limit: filters.limit,
    offset: filters.offset,
  })
}

export function updateRestaurantStatus(restaurantId: string, status: RestaurantStatus) {
  return apiClient.patch<{ restaurant: Restaurant }>(`/admin/restaurants/${restaurantId}`, { status })
}
