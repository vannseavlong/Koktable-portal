import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteCatalogItem } from '../data/catalog-items-api'
import { type CatalogItem } from '../data/schema'

type CatalogItemsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: CatalogItem
}

export function CatalogItemsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: CatalogItemsDeleteDialogProps) {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteCatalogItem(currentRow.item_id),
    onSuccess: () => {
      toast.success(`"${currentRow.name}" was permanently deleted.`)
      queryClient.invalidateQueries({ queryKey: ['my-catalog-items'] })
      setValue('')
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='catalog-items-delete-form'
      disabled={value.trim() !== currentRow.name || isPending}
      isLoading={isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Permanently Delete Item
        </span>
      }
      desc={
        <form
          id='catalog-items-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            mutate()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.name}</span>? This is a{' '}
            <span className='font-bold'>hard delete</span> — the catalogue entry
            is removed for good, with no undo. Existing reservations that reference
            this item keep their own copy of the name, so they are unaffected.
          </p>

          <Label className='my-2'>
            Item name:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Type the item name to confirm.'
              autoFocus
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              If you just want to hide this from customers, use the Active
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
