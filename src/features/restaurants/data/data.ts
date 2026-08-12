import { type RestaurantStatus } from './schema'

export const statusStyles = new Map<RestaurantStatus, string>([
  [
    'pending',
    'bg-amber-100/40 text-amber-900 dark:text-amber-200 border-amber-300',
  ],
  [
    'unclaimed',
    'bg-violet-100/40 text-violet-900 dark:text-violet-200 border-violet-300',
  ],
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['suspended', 'bg-neutral-300/40 border-neutral-300'],
])

export const statusOptions: { label: string; value: RestaurantStatus }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Unclaimed', value: 'unclaimed'},
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
]

export const statusLabels: Record<RestaurantStatus, string> = {
  pending: 'Pending',
  unclaimed: 'Unclaimed',
  active: 'Active',
  suspended: 'Suspended',
}
