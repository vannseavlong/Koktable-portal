import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { statusLabels, statusStyles } from '../data/data'
import { primaryLocation } from '../data/location-schema'
import { updateRestaurantSubscription } from '../data/restaurants-api'
import { type Restaurant } from '../data/schema'
import {
  statusLabels as subscriptionStatusLabels,
  tierLabels,
  type SubscriptionStatus,
  type SubscriptionTier,
} from '../data/subscription-schema'
import { useRestaurants } from './restaurants-provider'

const SUBSCRIPTION_TIERS: SubscriptionTier[] = ['basic', 'pro']
const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  'trialing',
  'active',
  'past_due',
  'cancelled',
]

function daysRemaining(isoDate: string): number {
  const ms = new Date(isoDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
}

function SubscriptionEditor({ restaurant }: { restaurant: Restaurant }) {
  const queryClient = useQueryClient()
  const { setCurrentRow } = useRestaurants()
  const subscription = restaurant.subscription
  const tier = subscription?.tier ?? 'pro'
  const status = subscription?.status ?? 'trialing'

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: {
      tier?: SubscriptionTier
      status?: SubscriptionStatus
    }) => updateRestaurantSubscription(restaurant.restaurant_id, payload),
    onSuccess: ({ subscription: updated }) => {
      toast.success('Subscription updated.')
      const next = { ...restaurant, subscription: updated }
      setCurrentRow(next)
      queryClient.setQueryData(
        ['restaurants'],
        (current: { restaurants: Restaurant[] } | undefined) =>
          current
            ? {
                restaurants: current.restaurants.map((r) =>
                  r.restaurant_id === restaurant.restaurant_id ? next : r
                ),
              }
            : current
      )
    },
    onError: (error) => handleServerError(error),
  })

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Select
        value={tier}
        disabled={isPending}
        onValueChange={(value) => mutate({ tier: value as SubscriptionTier })}
      >
        <SelectTrigger className='h-8 w-28'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUBSCRIPTION_TIERS.map((t) => (
            <SelectItem key={t} value={t}>
              {tierLabels[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={status}
        disabled={isPending}
        onValueChange={(value) =>
          mutate({ status: value as SubscriptionStatus })
        }
      >
        <SelectTrigger className='h-8 w-32'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUBSCRIPTION_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {subscriptionStatusLabels[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {status === 'trialing' && subscription?.trial_ends_at && (
        <span className='text-xs text-muted-foreground'>
          {daysRemaining(subscription.trial_ends_at)} day
          {daysRemaining(subscription.trial_ends_at) === 1 ? '' : 's'} left
        </span>
      )}
    </div>
  )
}

type RestaurantsDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Restaurant
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='grid grid-cols-3 gap-2 py-1.5 text-sm'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='col-span-2'>{value}</dd>
    </div>
  )
}

export function RestaurantsDetailDialog({
  open,
  onOpenChange,
  currentRow,
}: RestaurantsDetailDialogProps) {
  const { setOpen } = useRestaurants()
  // Only used for a quick top-of-dialog glance (contact info moved to the dedicated
  // locations dialog below, to avoid two competing single-location displays).
  const location = primaryLocation(currentRow.locations)
  const locationCount = currentRow.locations?.length ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            {currentRow.name}
            <Badge
              variant='outline'
              className={cn('capitalize', statusStyles.get(currentRow.status))}
            >
              {statusLabels[currentRow.status]}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Restaurant {currentRow.restaurant_id}.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='max-h-[70vh]'>
          <dl className='divide-y'>
            <Field
              label='Owner'
              value={currentRow.owner_user_id || 'Invite not yet redeemed'}
            />
            <Field label='Description' value={currentRow.description || '—'} />
            <Field
              label='Subscription'
              value={<SubscriptionEditor restaurant={currentRow} />}
            />
            <Field
              label='Cuisine'
              value={
                currentRow.cuisines && currentRow.cuisines.length > 0 ? (
                  <div className='flex flex-wrap gap-1'>
                    {currentRow.cuisines.map((c) => (
                      <Badge
                        key={c}
                        variant='secondary'
                        className='font-normal'
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  '—'
                )
              }
            />
            {/* Full per-location detail (address, contact, rating, price, hours) lives
                in the dedicated locations dialog now that a restaurant can have more
                than one location — this is a summary + entry point, not a second
                competing single-location display. */}
            <Field
              label='Locations'
              value={
                <div className='flex flex-wrap items-center gap-3'>
                  <span>
                    {locationCount} location{locationCount === 1 ? '' : 's'}
                    {location?.city ? ` · ${location.city}` : ''}
                  </span>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setOpen('locations')}
                  >
                    Manage locations
                  </Button>
                </div>
              }
            />
          </dl>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
