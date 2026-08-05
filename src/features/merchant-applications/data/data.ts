import { type ApplicationStatus } from './schema'

export const statusStyles = new Map<ApplicationStatus, string>([
  [
    'pending',
    'bg-amber-100/40 text-amber-900 dark:text-amber-200 border-amber-300',
  ],
  [
    'approved',
    'bg-emerald-100/40 text-emerald-900 dark:text-emerald-200 border-emerald-300',
  ],
  [
    'rejected',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const statusOptions: { label: string; value: ApplicationStatus }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

export const statusLabels: Record<ApplicationStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

export function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
}
