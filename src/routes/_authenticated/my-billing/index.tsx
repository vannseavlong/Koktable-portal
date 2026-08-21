import { createFileRoute } from '@tanstack/react-router'
import { requireMerchantRole } from '@/lib/route-guards'
import { MyBilling } from '@/features/my-billing'

export const Route = createFileRoute('/_authenticated/my-billing/')({
  beforeLoad: requireMerchantRole,
  component: MyBilling,
})
