import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { requireAdminRole } from '@/lib/route-guards'
import { Restaurants } from '@/features/restaurants'

const restaurantsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(
      z.union([
        z.literal('pending'),
        z.literal('active'),
        z.literal('suspended'),
      ])
    )
    .optional()
    .catch([]),
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/restaurants/')({
  validateSearch: restaurantsSearchSchema,
  beforeLoad: requireAdminRole,
  component: Restaurants,
})
