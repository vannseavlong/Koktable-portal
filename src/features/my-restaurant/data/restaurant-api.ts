import { apiClient } from '@/lib/api-client'
import { type Restaurant } from './schema'

// `GET/PATCH /merchant/restaurant` (ADMIN_API.md § 5) — always scoped server-side to
// the caller's own restaurant from the JWT. Never send a `restaurant_id` here.
export function fetchMyRestaurant() {
  return apiClient.get<{ restaurant: Restaurant }>('/merchant/restaurant')
}

export type RestaurantUpdatePayload = Partial<{
  name: string
  description: string
  contact_email: string
  contact_phone: string
  hours: string
  category_id: string
  // string ('' clears it, unchanged if omitted) or a new file to upload
  logo: string | File
  banner: string | File
}>

// Always sent as multipart/form-data — logo/banner may be a File (upload), an
// empty string (clear), or omitted (leave unchanged); see ADMIN_API.md's
// "Merchant restaurant profile" section for the server-side contract.
export function updateMyRestaurant(payload: RestaurantUpdatePayload) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue
    formData.append(key, value)
  }
  return apiClient.patchForm<{ restaurant: Restaurant }>('/merchant/restaurant', formData)
}
