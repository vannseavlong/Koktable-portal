import { ShieldCheck, User as UserIcon } from 'lucide-react'
import { type UserRole, type UserStatus } from './schema'

export const statusTypes = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

export const statusOptions: { label: string; value: UserStatus }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export const roleIcons = new Map<UserRole, typeof UserIcon>([
  ['admin', ShieldCheck],
  ['user', UserIcon],
])

export const roleOptions: { label: string; value: UserRole }[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
]
