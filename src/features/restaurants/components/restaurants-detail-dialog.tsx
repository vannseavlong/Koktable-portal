import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { statusLabels, statusStyles } from '../data/data'
import { type Restaurant } from '../data/schema'
import { dayLabel, formatDayHours } from '../data/hours-schema'
import { primaryLocation } from '../data/location-schema'

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
  const location = primaryLocation(currentRow.locations)

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
          <DialogDescription>Restaurant {currentRow.restaurant_id}.</DialogDescription>
        </DialogHeader>
        <ScrollArea className='max-h-[70vh]'>
          <dl className='divide-y'>
            <Field
              label='Owner'
              value={currentRow.owner_user_id || 'Invite not yet redeemed'}
            />
            <Field label='Description' value={currentRow.description || '—'} />
            <Field
              label='Contact email'
              value={location?.contact_email || '—'}
            />
            <Field
              label='Contact phone'
              value={location?.contact_phone || '—'}
            />
            <Field label='Address' value={location?.address || '—'} />
            <Field label='City' value={location?.city || '—'} />
            <Field
              label='Cuisine'
              value={
                currentRow.cuisines && currentRow.cuisines.length > 0 ? (
                  <div className='flex flex-wrap gap-1'>
                    {currentRow.cuisines.map((c) => (
                      <Badge key={c} variant='secondary' className='font-normal'>
                        {c}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  '—'
                )
              }
            />
            <Field
              label='Rating'
              value={
                location?.rating != null
                  ? `★ ${location.rating.toFixed(1)}${
                      location.rating_count != null
                        ? ` (${location.rating_count} reviews)`
                        : ''
                    }`
                  : '—'
              }
            />
            <Field label='Price' value={location?.price_symbol || '—'} />
            <Field
              label='Hours'
              value={
                currentRow.hours && currentRow.hours.length > 0 ? (
                  <div className='flex flex-col'>
                    {currentRow.hours.map((day) => (
                      <span key={day.day_of_week}>
                        {dayLabel(day.day_of_week)}: {formatDayHours(day)}
                      </span>
                    ))}
                  </div>
                ) : (
                  '—'
                )
              }
            />
          </dl>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
