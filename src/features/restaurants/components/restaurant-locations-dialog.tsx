import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, SquarePen } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Location } from '../data/location-schema'
import {
  fetchRestaurants,
  updateRestaurantLocation,
} from '../data/restaurants-api'
import { type Restaurant } from '../data/schema'
import { RestaurantLocationMutateDialog } from './restaurant-location-mutate-dialog'

// Same query key + fetch as `index.tsx`'s restaurants list — subscribing to it here
// (rather than only trusting the `currentRow` snapshot the provider handed us) means
// this dialog re-renders with fresh data once the mutate dialog's/toggle mutation's
// `invalidateQueries(['restaurants'])` lands, without a separate optimistic-update path.
const PAGE_LIMIT = 100

type RestaurantLocationsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Restaurant
}

export function RestaurantLocationsDialog({
  open,
  onOpenChange,
  currentRow,
}: RestaurantLocationsDialogProps) {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => fetchRestaurants({ limit: PAGE_LIMIT }),
    enabled: open,
  })

  const restaurant =
    data?.restaurants.find(
      (r) => r.restaurant_id === currentRow.restaurant_id
    ) ?? currentRow
  const locations = restaurant.locations ?? []
  const activeCount = locations.filter((l) => l.active !== false).length

  const [mutateOpen, setMutateOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | undefined>(
    undefined
  )
  const [deactivateTarget, setDeactivateTarget] = useState<Location | null>(
    null
  )

  const { mutate: toggleActive, isPending: isToggling } = useMutation({
    mutationFn: ({
      location,
      active,
    }: {
      location: Location
      active: boolean
    }) =>
      updateRestaurantLocation(currentRow.restaurant_id, location.location_id, {
        active,
      }),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.active ? 'Location reactivated.' : 'Location deactivated.'
      )
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      setDeactivateTarget(null)
    },
    onError: (error) => handleServerError(error),
  })

  const openAddDialog = () => {
    setEditingLocation(undefined)
    setMutateOpen(true)
  }

  const openEditDialog = (location: Location) => {
    setEditingLocation(location)
    setMutateOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-xl'>
          <DialogHeader className='text-start'>
            <DialogTitle>Locations — {currentRow.name}</DialogTitle>
            <DialogDescription>
              Manage this restaurant&apos;s physical locations. Locations stay
              admin-created; deactivating hides one from customers without
              deleting it.
            </DialogDescription>
          </DialogHeader>

          <div className='flex justify-end'>
            <Button variant='outline' size='sm' onClick={openAddDialog}>
              <Plus className='size-4' /> Add location
            </Button>
          </div>

          <ScrollArea className='max-h-[55vh]'>
            <div className='space-y-3 pe-3'>
              {locations.length === 0 && (
                <p className='py-6 text-center text-sm text-muted-foreground'>
                  No locations yet.
                </p>
              )}
              {locations.map((location) => {
                const isActive = location.active !== false
                const isOnlyActive = isActive && activeCount <= 1
                return (
                  <div
                    key={location.location_id}
                    className='flex items-start justify-between gap-3 rounded-md border p-3'
                  >
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2 font-medium'>
                        {location.name || 'Unnamed location'}
                        <Badge variant={isActive ? 'outline' : 'secondary'}>
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {[location.address, location.city]
                          .filter(Boolean)
                          .join(', ') || '—'}
                      </p>
                    </div>
                    <div className='flex shrink-0 items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => openEditDialog(location)}
                      >
                        <SquarePen className='size-4' /> Edit
                      </Button>
                      {isActive ? (
                        <Button
                          variant='outline'
                          size='sm'
                          disabled={isOnlyActive || isToggling}
                          title={
                            isOnlyActive
                              ? "Can't deactivate a restaurant's only active location"
                              : undefined
                          }
                          onClick={() => setDeactivateTarget(location)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant='outline'
                          size='sm'
                          disabled={isToggling}
                          onClick={() =>
                            toggleActive({ location, active: true })
                          }
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <RestaurantLocationMutateDialog
        key={editingLocation?.location_id ?? 'new'}
        restaurantId={currentRow.restaurant_id}
        currentRow={editingLocation}
        open={mutateOpen}
        onOpenChange={setMutateOpen}
      />

      {deactivateTarget && (
        <ConfirmDialog
          open={!!deactivateTarget}
          onOpenChange={(state) => !state && setDeactivateTarget(null)}
          title={`Deactivate ${deactivateTarget.name || 'this location'}?`}
          desc='This hides the location from customers. You can reactivate it later.'
          confirmText='Deactivate'
          destructive
          isLoading={isToggling}
          handleConfirm={() =>
            toggleActive({ location: deactivateTarget, active: false })
          }
        />
      )}
    </>
  )
}
