import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { approveMerchantApplication } from '../data/merchant-applications-api'
import { type MerchantApplication } from '../data/schema'

type MerchantApplicationsApproveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: MerchantApplication
}

export function MerchantApplicationsApproveDialog({
  open,
  onOpenChange,
  currentRow,
}: MerchantApplicationsApproveDialogProps) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () => approveMerchantApplication(currentRow.application_id),
    onSuccess: () => {
      toast.success(
        `${currentRow.restaurant_name} approved. An invite email is on its way.`
      )
      queryClient.invalidateQueries({ queryKey: ['merchant-applications'] })
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Approve ${currentRow.restaurant_name}?`}
      desc={
        <p>
          This creates a restaurant for{' '}
          <span className='font-bold'>{currentRow.applicant_name}</span> and
          sends them an invite email to set up their account.
        </p>
      }
      confirmText='Approve'
      isLoading={isPending}
      handleConfirm={() => mutate()}
    />
  )
}
