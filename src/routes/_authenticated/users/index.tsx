import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { requireAdminRole } from '@/lib/route-guards'
import { Users } from '@/features/users'

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  status: z
    .array(z.union([z.literal('active'), z.literal('inactive')]))
    .optional()
    .catch([]),
  role: z
    .array(z.union([z.literal('user'), z.literal('admin')]))
    .optional()
    .catch([]),
  // Free-text search across name/email
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/users/')({
  validateSearch: usersSearchSchema,
  beforeLoad: requireAdminRole,
  component: Users,
})
