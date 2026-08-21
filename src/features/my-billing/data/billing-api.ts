import { apiClient } from '@/lib/api-client'
import { type Subscription } from '@/features/restaurants/data/subscription-schema'

// `GET /merchant/restaurant/subscription` (ADMIN_API.md § "Merchant restaurant
// profile") — read-only for merchants; tier/status changes are admin-only via
// `PATCH /admin/restaurants/:id/subscription`.
export function fetchMySubscription() {
  return apiClient.get<{ subscription: Subscription }>(
    '/merchant/restaurant/subscription'
  )
}
