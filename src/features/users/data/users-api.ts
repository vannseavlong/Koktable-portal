import { apiClient } from '@/lib/api-client'
import { type User, type UserStatus, type UsersListResponse } from './schema'

export type UsersFilters = {
  status?: UserStatus
  role?: string
  search?: string
  limit?: number
  offset?: number
}

export function fetchUsers(filters: UsersFilters = {}) {
  return apiClient.get<UsersListResponse>('/admin/users', {
    status: filters.status,
    role: filters.role,
    search: filters.search,
    limit: filters.limit,
    offset: filters.offset,
  })
}

export function updateUserStatus(userId: string, status: UserStatus) {
  return apiClient.patch<{ user: User }>(`/admin/users/${userId}`, { status })
}
