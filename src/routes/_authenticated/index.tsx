import { createFileRoute } from '@tanstack/react-router'
import { requireAdminRole } from '@/lib/route-guards'
import { Dashboard } from '@/features/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: requireAdminRole,
  component: Dashboard,
})
