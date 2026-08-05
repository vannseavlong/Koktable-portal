import { apiClient } from '@/lib/api-client'
import {
  type ApplicationStatus,
  type MerchantApplication,
  type MerchantApplicationsListResponse,
} from './schema'

export type MerchantApplicationFilters = {
  status?: ApplicationStatus
  search?: string
  limit?: number
  offset?: number
}

export function fetchMerchantApplications(
  filters: MerchantApplicationFilters = {}
) {
  return apiClient.get<MerchantApplicationsListResponse>(
    '/admin/merchant-applications',
    {
      status: filters.status,
      search: filters.search,
      limit: filters.limit,
      offset: filters.offset,
    }
  )
}

export function approveMerchantApplication(applicationId: string) {
  return apiClient.post<{ application: MerchantApplication }>(
    `/admin/merchant-applications/${applicationId}/approve`
  )
}

export function rejectMerchantApplication(
  applicationId: string,
  reason?: string
) {
  return apiClient.post<{ application: MerchantApplication }>(
    `/admin/merchant-applications/${applicationId}/reject`,
    { reason }
  )
}

export function resendMerchantApplicationInvite(applicationId: string) {
  return apiClient.post<{
    application: MerchantApplication
    restaurant: { restaurant_id: string; status: string }
    invite: { expires_at: string }
  }>(`/admin/merchant-applications/${applicationId}/resend-invite`)
}
