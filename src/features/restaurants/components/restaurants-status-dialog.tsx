import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { statusLabels } from '../data/data'
import { updateRestaurantStatus } from '../data/restaurants-api'
import { type Restaurant, type RestaurantStatus } from '../data/schema'

type RestaurantsStatusDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Restaurant
  targetStatus: RestaurantStatus
}

export function RestaurantsStatusDialog({
  open,
  onOpenChange,
  currentRow,
  targetStatus,
}: RestaurantsStatusDialogProps) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateRestaurantStatus(currentRow.restaurant_id, targetStatus),
    onSuccess: () => {
      toast.success(
        `${currentRow.name} is now ${statusLabels[targetStatus].toLowerCase()}.`
      )
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  const destructive = targetStatus === 'suspended'

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${destructive ? 'Suspend' : 'Reactivate'} ${currentRow.name}?`}
      desc={
        <p>
          This moves <span className='font-bold'>{currentRow.name}</span> from{' '}
          <span className='font-bold'>{statusLabels[currentRow.status]}</span>{' '}
          to <span className='font-bold'>{statusLabels[targetStatus]}</span>.
          {destructive &&
            " The restaurant's catalog is hidden from customers while suspended."}
        </p>
      }
      confirmText={destructive ? 'Suspend' : 'Reactivate'}
      destructive={destructive}
      isLoading={isPending}
      handleConfirm={() => mutate()}
    />
  )
}
