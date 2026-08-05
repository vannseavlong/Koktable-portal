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
              value={currentRow.contact_email || '—'}
            />
            <Field
              label='Contact phone'
              value={currentRow.contact_phone || '—'}
            />
            <Field label='Address' value={currentRow.address || '—'} />
            <Field label='City' value={currentRow.city || '—'} />
            <Field
              label='Cuisine'
              value={
                currentRow.cuisine && currentRow.cuisine.length > 0 ? (
                  <div className='flex flex-wrap gap-1'>
                    {currentRow.cuisine.map((c) => (
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
                currentRow.rating != null
                  ? `★ ${currentRow.rating.toFixed(1)}${
                      currentRow.rating_count != null
                        ? ` (${currentRow.rating_count} reviews)`
                        : ''
                    }`
                  : '—'
              }
            />
            <Field label='Price' value={currentRow.price_symbol || '—'} />
            <Field
              label='Opening hours'
              value={
                currentRow.opening_hours && currentRow.opening_hours.length > 0 ? (
                  <div className='flex flex-col'>
                    {currentRow.opening_hours.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </div>
                ) : (
                  currentRow.hours || '—'
                )
              }
            />
          </dl>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
