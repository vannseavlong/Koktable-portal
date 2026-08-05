import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { useCuisines } from '@/hooks/use-cuisines'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { type Restaurant } from '../data/schema'
import { updateMyRestaurantCuisines } from '../data/restaurant-api'

type RestaurantCuisinesDialogProps = {
  restaurant: Restaurant
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RestaurantCuisinesDialog({
  restaurant,
  open,
  onOpenChange,
}: RestaurantCuisinesDialogProps) {
  const queryClient = useQueryClient()
  const { cuisines, isLoading } = useCuisines()
  const [selected, setSelected] = useState<string[]>(restaurant.cuisines)

  const toggle = (name: string, checked: boolean) =>
    setSelected((prev) =>
      checked ? [...prev, name] : prev.filter((c) => c !== name)
    )

  const { mutate, isPending } = useMutation({
    mutationFn: () => updateMyRestaurantCuisines(selected),
    onSuccess: (data) => {
      toast.success('Cuisines updated.')
      queryClient.setQueryData(
        ['my-restaurant'],
        (current: { restaurant: Restaurant } | undefined) =>
          current
            ? { restaurant: { ...current.restaurant, cuisines: data.cuisines } }
            : current
      )
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setSelected(restaurant.cuisines)
        onOpenChange(next)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Cuisines</DialogTitle>
          <DialogDescription>
            Choose the cuisines that describe this restaurant. Saving
            replaces the full set.
          </DialogDescription>
        </DialogHeader>
        <div className='h-80 w-[calc(100%+0.75rem)] overflow-y-auto pe-3'>
          {isLoading ? (
            <p className='text-muted-foreground text-sm'>Loading cuisines…</p>
          ) : cuisines.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              No cuisines available yet.
            </p>
          ) : (
            <div className='grid grid-cols-2 gap-3'>
              {cuisines.map((cuisine) => (
                <label
                  key={cuisine.cuisine_id}
                  className='flex items-center gap-2 text-sm'
                >
                  <Checkbox
                    checked={selected.includes(cuisine.name)}
                    onCheckedChange={(checked) =>
                      toggle(cuisine.name, checked === true)
                    }
                  />
                  {cuisine.icon && <span>{cuisine.icon}</span>}
                  <Label className='font-normal'>{cuisine.name}</Label>
                </label>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => mutate()} disabled={isPending}>
            Save cuisines
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
