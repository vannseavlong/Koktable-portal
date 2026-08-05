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
import { type MerchantApplication } from '../data/schema'

type MerchantApplicationsDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: MerchantApplication
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='grid grid-cols-3 gap-2 py-1.5 text-sm'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='col-span-2'>{value}</dd>
    </div>
  )
}

export function MerchantApplicationsDetailDialog({
  open,
  onOpenChange,
  currentRow,
}: MerchantApplicationsDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            {currentRow.restaurant_name}
            <Badge
              variant='outline'
              className={cn('capitalize', statusStyles.get(currentRow.status))}
            >
              {statusLabels[currentRow.status]}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Merchant application {currentRow.application_id}.
          </DialogDescription>
        </DialogHeader>
        <dl className='divide-y'>
          <Field label='Applicant' value={currentRow.applicant_name} />
          <Field label='Email' value={currentRow.contact_email} />
          <Field label='Phone' value={currentRow.contact_phone || '—'} />
          <Field label='Description' value={currentRow.description || '—'} />
          <Field label='Submitted' value={formatDate(currentRow._created_at)} />
          {currentRow.status === 'rejected' && (
            <Field
              label='Rejection reason'
              value={currentRow.rejection_reason || '—'}
            />
          )}
        </dl>
      </DialogContent>
    </Dialog>
  )
}
