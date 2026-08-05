import { z } from 'zod'

const userStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([z.literal('user'), z.literal('admin')])
export type UserRole = z.infer<typeof userRoleSchema>

// Matches the `User` object documented in ADMIN_API.md — the same shape
// returned by `POST /user/auth/login` / `GET /user/auth/me`, minus password
// fields (those live in the separate `credentials` table).
const _userSchema = z.object({
  user_id: z.string(),
  email: z.string(),
  full_name: z.string(),
  picture: z.string().optional(),
  role: userRoleSchema,
  auth_provider: z.string().optional(),
  actor_sheet_id: z.string().optional(),
  status: userStatusSchema,
})
export type User = z.infer<typeof _userSchema>

export const usersListResponseSchema = z.object({
  users: z.array(_userSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})
export type UsersListResponse = z.infer<typeof usersListResponseSchema>
