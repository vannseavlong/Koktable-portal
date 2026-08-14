import { apiClient } from '@/lib/api-client'
import { type Reservation, type ReservationStatus } from './schema'

export type ReservationFilters = {
  status?: ReservationStatus
  limit?: number
  offset?: number
}

export type ReservationsListResponse = {
  reservations: Reservation[]
  total: number
  limit: number
  offset: number
}

export function fetchReservations(filters: ReservationFilters = {}) {
  return apiClient.get<ReservationsListResponse>('/admin/reservations', {
    status: filters.status,
    limit: filters.limit,
    offset: filters.offset,
  })
}

export function updateReservationStatus(
  reservationId: string,
  userId: string,
  status: ReservationStatus
) {
  return apiClient.patch<{ reservation: Reservation }>(
    `/admin/reservations/${reservationId}`,
    {
      user_id: userId,
      status,
    }
  )
}
