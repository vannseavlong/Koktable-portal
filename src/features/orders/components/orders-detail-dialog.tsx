import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDate, statusLabels, statusStyles } from '../data/data'
import { type Reservation } from '../data/schema'

type OrdersDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Reservation
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='grid grid-cols-3 gap-2 py-1.5 text-sm'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='col-span-2'>{value}</dd>
    </div>
  )
}

export function OrdersDetailDialog({
  open,
  onOpenChange,
  currentRow,
}: OrdersDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            Reservation {currentRow.reservation_id}
            <Badge
              variant='outline'
              className={cn('capitalize', statusStyles.get(currentRow.status))}
            >
              {statusLabels[currentRow.status]}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Full details for this reservation, as returned by the admin API.
          </DialogDescription>
        </DialogHeader>
        <dl className='divide-y'>
          <Field
            label='Guest'
            value={`${currentRow.guest_name} (${currentRow.party_size})`}
          />
          <Field label='Service' value={currentRow.service_name} />
          {currentRow.restaurant_id && (
            <Field label='Restaurant ID' value={currentRow.restaurant_id} />
          )}
          <Field
            label='Dates'
            value={`${formatDate(currentRow.start_date)} → ${formatDate(currentRow.end_date)} (${currentRow.nights} night${currentRow.nights === 1 ? '' : 's'})`}
          />
          <Field
            label='Daily rate'
            value={`$${currentRow.daily_rate.toFixed(2)}`}
          />
          <Field label='Total' value={`$${currentRow.total.toFixed(2)}`} />
          <Field label='Owner' value={currentRow.user_name} />
          <Field label='Owner email' value={currentRow.user_email} />
          <Field label='Notes' value={currentRow.notes || '—'} />
        </dl>
      </DialogContent>
    </Dialog>
  )
}
