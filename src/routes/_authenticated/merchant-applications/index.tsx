import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { requireAdminRole } from '@/lib/route-guards'
import { MerchantApplications } from '@/features/merchant-applications'

const merchantApplicationsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(
      z.union([
        z.literal('pending'),
        z.literal('approved'),
        z.literal('rejected'),
      ])
    )
    .optional()
    .catch([]),
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/merchant-applications/')({
  validateSearch: merchantApplicationsSearchSchema,
  beforeLoad: requireAdminRole,
  component: MerchantApplications,
})
