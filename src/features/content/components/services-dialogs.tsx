import { ServicesDeleteDialog } from './services-delete-dialog'
import { ServicesMutateDialog } from './services-mutate-dialog'
import { useServices } from './services-provider'

export function ServicesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useServices()

  return (
    <>
      <ServicesMutateDialog
        key='service-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <>
          <ServicesMutateDialog
            key={`service-edit-${currentRow.service_id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />

          <ServicesDeleteDialog
            key={`service-delete-${currentRow.service_id}`}
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
