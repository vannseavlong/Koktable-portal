import { MerchantApplicationsApproveDialog } from './merchant-applications-approve-dialog'
import { MerchantApplicationsDetailDialog } from './merchant-applications-detail-dialog'
import { useMerchantApplications } from './merchant-applications-provider'
import { MerchantApplicationsRejectDialog } from './merchant-applications-reject-dialog'
import { MerchantApplicationsResendDialog } from './merchant-applications-resend-dialog'

export function MerchantApplicationsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useMerchantApplications()

  if (!currentRow) return null

  return (
    <>
      <MerchantApplicationsDetailDialog
        key={`application-detail-${currentRow.application_id}`}
        open={open === 'detail'}
        onOpenChange={() => {
          setOpen('detail')
          setTimeout(() => setCurrentRow(null), 500)
        }}
        currentRow={currentRow}
      />

      <MerchantApplicationsApproveDialog
        key={`application-approve-${currentRow.application_id}`}
        open={open === 'approve'}
        onOpenChange={() => {
          setOpen('approve')
          setTimeout(() => setCurrentRow(null), 500)
        }}
        currentRow={currentRow}
      />

      <MerchantApplicationsRejectDialog
        key={`application-reject-${currentRow.application_id}`}
        open={open === 'reject'}
        onOpenChange={() => {
          setOpen('reject')
          setTimeout(() => setCurrentRow(null), 500)
        }}
        currentRow={currentRow}
      />

      <MerchantApplicationsResendDialog
        key={`application-resend-${currentRow.application_id}`}
        open={open === 'resend'}
        onOpenChange={() => {
          setOpen('resend')
          setTimeout(() => setCurrentRow(null), 500)
        }}
        currentRow={currentRow}
      />
    </>
  )
}
