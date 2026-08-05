import { createFileRoute } from '@tanstack/react-router'
import { MerchantInviteAccept } from '@/features/merchant-invite'

export const Route = createFileRoute('/(auth)/invite/$token')({
  component: MerchantInviteAccept,
})
