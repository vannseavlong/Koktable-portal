import { useUsers } from './users-provider'
import { UsersStatusDialog } from './users-status-dialog'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()

  if (!currentRow) return null

  return (
    <UsersStatusDialog
      key={`user-status-${currentRow.user_id}`}
      open={open === 'status'}
      onOpenChange={() => {
        setOpen('status')
        setTimeout(() => {
          setCurrentRow(null)
        }, 500)
      }}
      currentRow={currentRow}
    />
  )
}
