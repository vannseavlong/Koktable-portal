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
import { statusLabels, statusStyles } from '../data/data'
import { primaryLocation } from '../data/location-schema'
import { type Restaurant } from '../data/schema'
import { useRestaurants } from './restaurants-provider'

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
