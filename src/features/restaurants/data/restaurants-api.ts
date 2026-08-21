import { apiClient } from '@/lib/api-client'
import { type Location } from './location-schema'
import {
  type Restaurant,
  type RestaurantStatus,
  type RestaurantsListResponse,
} from './schema'
import {
  type Subscription,
  type SubscriptionStatus,
  type SubscriptionTier,
} from './subscription-schema'

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

export function updateRestaurantStatus(
  restaurantId: string,
  status: RestaurantStatus
) {
  return apiClient.patch<{ restaurant: Restaurant }>(
    `/admin/restaurants/${restaurantId}`,
    { status }
  )
}

// Matches `LocationInput` in `Backend/src/services/restaurantLocations.service.ts` —
// every field optional, `active` added for the deactivate/reactivate PATCH (Phase 3).
export type LocationInput = {
  name?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  city?: string
  latitude?: number
  longitude?: number
  active?: boolean
}

export function createRestaurantLocation(
  restaurantId: string,
  payload: LocationInput
) {
  return apiClient.post<{ location: Location }>(
    `/admin/restaurants/${restaurantId}/locations`,
    payload
  )
}

export function updateRestaurantLocation(
  restaurantId: string,
  locationId: string,
  payload: LocationInput
) {
  return apiClient.patch<{ location: Location }>(
    `/admin/restaurants/${restaurantId}/locations/${locationId}`,
    payload
  )
}

export function updateRestaurantSubscription(
  restaurantId: string,
  payload: { tier?: SubscriptionTier; status?: SubscriptionStatus }
) {
  return apiClient.patch<{ subscription: Subscription }>(
    `/admin/restaurants/${restaurantId}/subscription`,
    payload
  )
}
