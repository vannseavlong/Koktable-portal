import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Cuisine } from '../data/schema'
import { deleteCuisine } from '../data/cuisines-api'

type CuisinesDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Cuisine
}

export function CuisinesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: CuisinesDeleteDialogProps) {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteCuisine(currentRow.cuisine_id),
    onSuccess: () => {
      toast.success(`"${currentRow.name}" was permanently deleted.`)
      queryClient.invalidateQueries({ queryKey: ['cuisines'] })
      setValue('')
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='cuisines-delete-form'
      disabled={value.trim() !== currentRow.name || isPending}
      isLoading={isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Permanently Delete Cuisine
        </span>
      }
      desc={
        <form
          id='cuisines-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            mutate()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.name}</span>? This is a{' '}
            <span className='font-bold'>hard delete</span> — the cuisine is
            removed for good, with no undo. Restaurants still pointing at
            this cuisine keep the stale reference rather than being cleared.
          </p>

          <Label className='my-2'>
            Cuisine name:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Type the cuisine name to confirm.'
              autoFocus
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              If you just want to hide this from dropdowns, use the Active
              toggle instead — this action cannot be rolled back.
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText='Delete permanently'
      destructive
    />
  )
}
