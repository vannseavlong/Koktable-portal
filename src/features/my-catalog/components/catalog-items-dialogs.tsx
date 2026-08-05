import { CatalogItemsDeleteDialog } from './catalog-items-delete-dialog'
import { CatalogItemsMutateDialog } from './catalog-items-mutate-dialog'
import { useCatalogItems } from './catalog-items-provider'

export function CatalogItemsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCatalogItems()

  return (
    <>
      <CatalogItemsMutateDialog
        key='catalog-item-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <>
          <CatalogItemsMutateDialog
            key={`catalog-item-edit-${currentRow.item_id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />

          <CatalogItemsDeleteDialog
            key={`catalog-item-delete-${currentRow.item_id}`}
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
