import { apiClient } from '@/lib/api-client'
import { type MerchantInviteInfo } from './schema'

type MerchantAcceptResponse = {
  token: string
  user: { user_id: string; email: string; full_name: string; role: string }
  restaurant: { restaurant_id: string; name: string }
}

export function getMerchantInvite(token: string) {
  return apiClient.get<MerchantInviteInfo>(
    `/merchant/invite/${encodeURIComponent(token)}`
  )
}

export function acceptMerchantInvite(
  token: string,
  data: { full_name: string; password: string }
) {
  return apiClient.post<MerchantAcceptResponse>(
    `/merchant/invite/${encodeURIComponent(token)}`,
    data
  )
}
