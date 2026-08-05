import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { statusLabels } from '../data/data'
import { updateOrderStatus } from '../data/orders-api'
import { type Order, type OrderStatus } from '../data/schema'

type MyOrdersStatusDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Order
  targetStatus: OrderStatus
}

export function MyOrdersStatusDialog({
  open,
  onOpenChange,
  currentRow,
  targetStatus,
}: MyOrdersStatusDialogProps) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateOrderStatus(
        currentRow.reservation_id,
        currentRow.user_id,
        targetStatus
      ),
    onSuccess: () => {
      toast.success(
        `Order for ${currentRow.guest_name} moved to "${statusLabels[targetStatus]}".`
      )
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  const destructive = targetStatus === 'cancelled'

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Move order to "${statusLabels[targetStatus]}"?`}
      desc={
        <p>
          Order <span className='font-mono'>{currentRow.reservation_id}</span> for{' '}
          <span className='font-bold'>{currentRow.guest_name}</span> (
          {currentRow.service_name}) will move from{' '}
          <span className='font-bold'>{statusLabels[currentRow.status]}</span>{' '}
          to <span className='font-bold'>{statusLabels[targetStatus]}</span>.
          {destructive && ' This cancels the order.'}
        </p>
      }
      confirmText={`Move to ${statusLabels[targetStatus]}`}
      destructive={destructive}
      isLoading={isPending}
      handleConfirm={() => mutate()}
    />
  )
}
