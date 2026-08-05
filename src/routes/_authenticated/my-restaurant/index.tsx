import { createFileRoute } from '@tanstack/react-router'
import { requireMerchantRole } from '@/lib/route-guards'
import { MyRestaurant } from '@/features/my-restaurant'

export const Route = createFileRoute('/_authenticated/my-restaurant/')({
  beforeLoad: requireMerchantRole,
  component: MyRestaurant,
})
