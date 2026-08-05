import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User, type UserStatus } from '../data/schema'
import { updateUserStatus } from '../data/users-api'

type UsersStatusDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersStatusDialog({
  open,
  onOpenChange,
  currentRow,
}: UsersStatusDialogProps) {
  const queryClient = useQueryClient()
  const nextStatus: UserStatus =
    currentRow.status === 'active' ? 'inactive' : 'active'

  const { mutate, isPending } = useMutation({
    mutationFn: () => updateUserStatus(currentRow.user_id, nextStatus),
    onSuccess: () => {
      toast.success(
        `${currentRow.full_name} is now ${nextStatus === 'active' ? 'active' : 'inactive'}.`
      )
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        nextStatus === 'inactive'
          ? `Deactivate ${currentRow.full_name}?`
          : `Reactivate ${currentRow.full_name}?`
      }
      desc={
        nextStatus === 'inactive' ? (
          <p>
            This marks the account as{' '}
            <span className='font-bold'>inactive</span>. Note: this is
            informational only for now — it does not yet block the user from
            logging into the mobile app.
          </p>
        ) : (
          <p>
            This marks the account as <span className='font-bold'>active</span>{' '}
            again.
          </p>
        )
      }
      confirmText={nextStatus === 'inactive' ? 'Deactivate' : 'Reactivate'}
      destructive={nextStatus === 'inactive'}
      isLoading={isPending}
      handleConfirm={() => mutate()}
    />
  )
}
