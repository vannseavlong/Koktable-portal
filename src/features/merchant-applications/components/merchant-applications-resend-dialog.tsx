import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { resendMerchantApplicationInvite } from '../data/merchant-applications-api'
import { type MerchantApplication } from '../data/schema'

type MerchantApplicationsResendDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: MerchantApplication
}

export function MerchantApplicationsResendDialog({
  open,
  onOpenChange,
  currentRow,
}: MerchantApplicationsResendDialogProps) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      resendMerchantApplicationInvite(currentRow.application_id),
    onSuccess: () => {
      toast.success(`Invite resent to ${currentRow.contact_email}.`)
      queryClient.invalidateQueries({ queryKey: ['merchant-applications'] })
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Resend invite for ${currentRow.restaurant_name}?`}
      desc={
        <p>
          This invalidates the previous invite link and emails{' '}
          <span className='font-bold'>{currentRow.contact_email}</span> a new
          one.
        </p>
      }
      confirmText='Resend'
      isLoading={isPending}
      handleConfirm={() => mutate()}
    />
  )
}
