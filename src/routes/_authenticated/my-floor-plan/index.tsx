import { createFileRoute } from '@tanstack/react-router'
import { requireMerchantRole } from '@/lib/route-guards'
import { MyFloorPlan } from '@/features/my-floor-plan'

export const Route = createFileRoute('/_authenticated/my-floor-plan/')({
  beforeLoad: requireMerchantRole,
  component: MyFloorPlan,
})
