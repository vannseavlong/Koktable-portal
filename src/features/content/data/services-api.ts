import { apiClient } from '@/lib/api-client'
import { type Service } from './schema'

export type ServiceFilters = {
  active?: boolean
  category_id?: string
}

export function fetchServices(filters: ServiceFilters = {}) {
  return apiClient.get<{ services: Service[] }>('/admin/services', {
    active: filters.active,
    category_id: filters.category_id,
  })
}

export type ServicePayload = {
  name: string
  description?: string
  price_from: number
  icon: string
  color: string
  category_id: string
  active?: boolean
  sort_order?: number
}

export function createService(payload: ServicePayload) {
  return apiClient.post<{ service: Service }>('/admin/services', payload)
}

export function updateService(
  serviceId: string,
  payload: Partial<ServicePayload>
) {
  return apiClient.patch<{ service: Service }>(
    `/admin/services/${serviceId}`,
    payload
  )
}

export function deleteService(serviceId: string) {
  return apiClient.delete<void>(`/admin/services/${serviceId}`)
}

export function reorderServices(order: string[]) {
  return apiClient.patch<{ services: Service[] }>('/admin/services/reorder', {
    order,
  })
}
