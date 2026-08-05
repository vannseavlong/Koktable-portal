import { createFileRoute } from '@tanstack/react-router'
import { MerchantRegister } from '@/features/merchant-register'

export const Route = createFileRoute('/(auth)/register')({
  component: MerchantRegister,
})
