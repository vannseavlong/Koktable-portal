import { CuisinesDeleteDialog } from './cuisines-delete-dialog'
import { CuisinesMutateDialog } from './cuisines-mutate-dialog'
import { useCuisinesContext } from './cuisines-provider'

export function CuisinesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCuisinesContext()

  return (
    <>
      <CuisinesMutateDialog
        key='cuisine-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <>
          <CuisinesMutateDialog
            key={`cuisine-edit-${currentRow.cuisine_id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />

          <CuisinesDeleteDialog
            key={`cuisine-delete-${currentRow.cuisine_id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
