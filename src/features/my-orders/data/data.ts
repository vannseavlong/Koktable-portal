import { type OrderStatus } from './schema'

export const statusStyles = new Map<OrderStatus, string>([
  [
    'pending',
    'bg-amber-100/40 text-amber-900 dark:text-amber-200 border-amber-300',
  ],
  ['confirmed', 'bg-sky-100/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  [
    'completed',
    'bg-emerald-100/40 text-emerald-900 dark:text-emerald-200 border-emerald-300',
  ],
  [
    'cancelled',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const statusOptions: { label: string; value: OrderStatus }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

/** The API returns ISO datetimes for start/end dates; render them concisely. */
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
