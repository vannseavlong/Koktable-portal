import { MyOrdersDetailDialog } from './my-orders-detail-dialog'
import { useMyOrders } from './my-orders-provider'
import { MyOrdersStatusDialog } from './my-orders-status-dialog'

export function MyOrdersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, targetStatus } =
    useMyOrders()

  if (!currentRow) return null

  return (
    <>
      <MyOrdersDetailDialog
        key={`order-detail-${currentRow.reservation_id}`}
        open={open === 'detail'}
        onOpenChange={() => {
          setOpen('detail')
          setTimeout(() => setCurrentRow(null), 500)
        }}
        currentRow={currentRow}
      />

      {targetStatus && (
        <MyOrdersStatusDialog
          key={`order-status-${currentRow.reservation_id}-${targetStatus}`}
          open={open === 'status'}
          onOpenChange={() => {
            setOpen('status')
            setTimeout(() => setCurrentRow(null), 500)
          }}
          currentRow={currentRow}
          targetStatus={targetStatus}
        />
      )}
    </>
  )
}
