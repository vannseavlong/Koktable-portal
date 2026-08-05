import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { updateReservationStatus } from '../data/reservations-api'
import { statusLabels } from '../data/data'
import { type Reservation, type ReservationStatus } from '../data/schema'

type OrdersStatusDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Reservation
  targetStatus: ReservationStatus
}

export function OrdersStatusDialog({
  open,
  onOpenChange,
  currentRow,
  targetStatus,
}: OrdersStatusDialogProps) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateReservationStatus(
        currentRow.reservation_id,
        currentRow.user_id,
        targetStatus
      ),
    onSuccess: () => {
      toast.success(
        `Reservation for ${currentRow.guest_name} moved to "${statusLabels[targetStatus]}".`
      )
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  const destructive = targetStatus === 'cancelled'

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Move reservation to "${statusLabels[targetStatus]}"?`}
      desc={
        <p>
          Reservation <span className='font-mono'>{currentRow.reservation_id}</span> for{' '}
          <span className='font-bold'>{currentRow.guest_name}</span> (
          {currentRow.service_name}) will move from{' '}
          <span className='font-bold'>{statusLabels[currentRow.status]}</span>{' '}
          to <span className='font-bold'>{statusLabels[targetStatus]}</span>.
          {destructive && ' This cancels the reservation.'}
        </p>
      }
      confirmText={`Move to ${statusLabels[targetStatus]}`}
      destructive={destructive}
      isLoading={isPending}
      handleConfirm={() => mutate()}
    />
  )
}
