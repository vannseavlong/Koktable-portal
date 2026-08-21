import { useQuery } from '@tanstack/react-query'
import { CircleCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  statusLabels,
  tierLabels,
  type SubscriptionStatus,
} from '@/features/restaurants/data/subscription-schema'
import { fetchMySubscription } from './data/billing-api'

const statusStyles: Record<SubscriptionStatus, string> = {
  trialing:
    'bg-amber-100/40 text-amber-900 dark:text-amber-200 border-amber-300',
  active: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  past_due: 'bg-red-100/40 text-red-900 dark:text-red-200 border-red-300',
  cancelled: 'bg-neutral-300/40 border-neutral-300',
}

// Basic vs Pro, mirrors Overview.md §5's comparison table — display-only here, the
// limits themselves are enforced server-side (currently just the branch limit; see
// ADMIN_API.md § 5's "Tier enforcement" note).
const TIER_FEATURES = [
  { label: '1 location', pro: false },
  { label: 'Unlimited locations', pro: true },
  { label: 'Standard listing', pro: false },
  { label: 'Featured/promoted eligible', pro: true },
  { label: 'Basic analytics', pro: false },
  { label: 'Full analytics', pro: true },
]

function daysRemaining(isoDate: string): number {
  const ms = new Date(isoDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
}

export function MyBilling() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-billing'],
    queryFn: () => fetchMySubscription(),
  })
  const subscription = data?.subscription

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Billing</h2>
          <p className='text-muted-foreground'>
            Your current plan and subscription status.
          </p>
        </div>

        {isError && (
          <p className='text-destructive'>
            Failed to load your subscription. Please try again.
          </p>
        )}
        {isLoading && (
          <p className='text-muted-foreground'>Loading your subscription…</p>
        )}

        {subscription && (
          <Card className='max-w-2xl'>
            <CardHeader>
              <div className='flex flex-wrap items-center gap-2'>
                <CardTitle className='text-xl'>
                  {tierLabels[subscription.tier]} plan
                </CardTitle>
                <Badge
                  variant='outline'
                  className={statusStyles[subscription.status]}
                >
                  {statusLabels[subscription.status]}
                </Badge>
              </div>
              {subscription.status === 'trialing' &&
                subscription.trial_ends_at && (
                  <CardDescription>
                    Your free Pro trial ends in{' '}
                    {daysRemaining(subscription.trial_ends_at)} day
                    {daysRemaining(subscription.trial_ends_at) === 1 ? '' : 's'}
                    .
                  </CardDescription>
                )}
            </CardHeader>
            <CardContent className='flex flex-col gap-6'>
              <ul className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                {TIER_FEATURES.filter(
                  (f) => !f.pro || subscription.tier === 'pro'
                )
                  .filter((f) => f.pro || subscription.tier === 'basic')
                  .map((f) => (
                    <li
                      key={f.label}
                      className='flex items-center gap-2 text-sm'
                    >
                      <CircleCheck className='size-4 shrink-0 text-teal-600 dark:text-teal-400' />
                      {f.label}
                    </li>
                  ))}
              </ul>

              <div className='flex flex-col items-start gap-1 rounded-md border bg-muted/40 p-4'>
                <p className='text-sm font-medium'>
                  Self-serve plan changes aren't available yet.
                </p>
                <p className='text-sm text-muted-foreground'>
                  {subscription.tier === 'pro'
                    ? 'Want to change your plan? Reach out to your KokTable account contact.'
                    : 'Ready for unlimited locations, promoted listings, and full analytics? Reach out to your KokTable account contact to upgrade to Pro.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}
