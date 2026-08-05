import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createRestaurantLocation, updateRestaurantLocation } from '../data/restaurants-api'
import { type Location } from '../data/location-schema'

// Mirrors `LocationInput` (restaurants-api.ts) — every field optional, matching
// `Backend/src/services/restaurantLocations.service.ts`. `latitude`/`longitude` use
// `z.coerce.number()` the same way `catalog-items-mutate-dialog.tsx` handles its
// optional numeric fields, so the form's input type (raw string from an <input>)
// differs from the submitted payload type.
const formSchema = z.object({
  name: z.string().optional(),
  contact_email: z.string().optional(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
})
type LocationFormInput = z.input<typeof formSchema>
type LocationForm = z.output<typeof formSchema>

type RestaurantLocationMutateDialogProps = {
  restaurantId: string
  // Present when editing an existing location; omitted when adding a new one.
  currentRow?: Location
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RestaurantLocationMutateDialog({
  restaurantId,
  currentRow,
  open,
  onOpenChange,
}: RestaurantLocationMutateDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()

  const form = useForm<LocationFormInput, unknown, LocationForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name ?? '',
          contact_email: currentRow.contact_email ?? '',
          contact_phone: currentRow.contact_phone ?? '',
          address: currentRow.address ?? '',
          city: currentRow.city ?? '',
          latitude: currentRow.latitude,
          longitude: currentRow.longitude,
        }
      : {
          name: '',
          contact_email: '',
          contact_phone: '',
          address: '',
          city: '',
        },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: LocationForm) =>
      isEdit
        ? updateRestaurantLocation(restaurantId, currentRow.location_id, values)
        : createRestaurantLocation(restaurantId, values),
    onSuccess: () => {
      toast.success(isEdit ? 'Location updated.' : 'Location added.')
      // Simplest safe cache update for a list view (per restaurants-status-dialog.tsx) —
      // the sibling locations dialog subscribes to the same ['restaurants'] query key
      // and re-renders once the refetch lands.
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      form.reset()
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  const onSubmit = (values: LocationForm) => mutate(values)

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Location' : 'Add Location'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update this location here.'
              : "Add a new location for this restaurant."}{' '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='restaurant-location-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 px-0.5 py-1'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Downtown Branch'
                      className='col-span-4'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='contact_email'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>
                    Contact email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='sam@goldenfork.example'
                      className='col-span-4'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='contact_phone'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>
                    Contact phone
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='+1 555 0100'
                      className='col-span-4'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='218 Street 184, Phnom Penh 12211, Cambodia'
                      className='col-span-4'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='city'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>City</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Phnom Penh'
                      className='col-span-4'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='latitude'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Latitude</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='any'
                      placeholder='11.5646873'
                      className='col-span-4'
                      {...field}
                      value={field.value as string | number}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='longitude'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Longitude</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='any'
                      placeholder='104.922673'
                      className='col-span-4'
                      {...field}
                      value={field.value as string | number}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='restaurant-location-form' disabled={isPending}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
