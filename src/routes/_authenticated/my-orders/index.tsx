import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { requireMerchantRole } from '@/lib/route-guards'
import { MyOrders } from '@/features/my-orders'

const myOrdersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(
      z.union([
        z.literal('pending'),
        z.literal('confirmed'),
        z.literal('active'),
        z.literal('completed'),
        z.literal('cancelled'),
      ])
    )
    .optional()
    .catch([]),
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/my-orders/')({
  validateSearch: myOrdersSearchSchema,
  beforeLoad: requireMerchantRole,
  component: MyOrders,
})
