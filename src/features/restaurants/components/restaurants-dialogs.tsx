import { RestaurantFloorPlanDialog } from './restaurant-floor-plan-dialog'
import { RestaurantLocationsDialog } from './restaurant-locations-dialog'
import { RestaurantsDetailDialog } from './restaurants-detail-dialog'
import { useRestaurants } from './restaurants-provider'
import { RestaurantsStatusDialog } from './restaurants-status-dialog'

export function RestaurantsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, targetStatus } =
    useRestaurants()

  if (!currentRow) return null

  return (
    <>
      <RestaurantsDetailDialog
        key={`restaurant-detail-${currentRow.restaurant_id}`}
        open={open === 'detail'}
        onOpenChange={() => {
          setOpen('detail')
          setTimeout(() => setCurrentRow(null), 500)
        }}
        currentRow={currentRow}
      />

      <RestaurantLocationsDialog
        key={`restaurant-locations-${currentRow.restaurant_id}`}
        open={open === 'locations'}
        onOpenChange={() => {
          setOpen('locations')
          setTimeout(() => setCurrentRow(null), 500)
        }}
        currentRow={currentRow}
      />

      <RestaurantFloorPlanDialog
        key={`restaurant-floor-plan-${currentRow.restaurant_id}`}
        open={open === 'floor-plan'}
        onOpenChange={() => {
          setOpen('floor-plan')
          setTimeout(() => setCurrentRow(null), 500)
        }}
        currentRow={currentRow}
      />

      {targetStatus && (
        <RestaurantsStatusDialog
          key={`restaurant-status-${currentRow.restaurant_id}-${targetStatus}`}
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
