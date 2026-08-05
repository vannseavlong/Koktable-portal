import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { requireMerchantRole } from '@/lib/route-guards'
import { MyProducts } from '@/features/my-products'

const myProductsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  active: z
    .array(z.union([z.literal('active'), z.literal('inactive')]))
    .optional()
    .catch([]),
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/my-products/')({
  validateSearch: myProductsSearchSchema,
  beforeLoad: requireMerchantRole,
  component: MyProducts,
})
