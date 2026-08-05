import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { requireAdminRole } from '@/lib/route-guards'
import { Content } from '@/features/content'

const contentSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  category_id: z.array(z.string()).optional().catch([]),
  active: z
    .array(z.union([z.literal('active'), z.literal('inactive')]))
    .optional()
    .catch([]),
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/content/')({
  validateSearch: contentSearchSchema,
  beforeLoad: requireAdminRole,
  component: Content,
})
