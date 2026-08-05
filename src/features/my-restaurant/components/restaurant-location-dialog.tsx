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
import { type Restaurant } from '../data/schema'
import { updateMyRestaurantLocation } from '../data/restaurant-api'

const formSchema = z.object({
  contact_email: z.email('Enter a valid email.').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
})
type LocationFormValues = z.infer<typeof formSchema>

function toFormValues(restaurant: Restaurant): LocationFormValues {
  return {
    contact_email: restaurant.location?.contact_email ?? '',
    contact_phone: restaurant.location?.contact_phone ?? '',
    address: restaurant.location?.address ?? '',
    city: restaurant.location?.city ?? '',
  }
}

type RestaurantLocationDialogProps = {
  restaurant: Restaurant
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RestaurantLocationDialog({
  restaurant,
  open,
  onOpenChange,
}: RestaurantLocationDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(formSchema),
    values: toFormValues(restaurant),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: LocationFormValues) => updateMyRestaurantLocation(values),
    onSuccess: (data) => {
      toast.success('Location updated.')
      queryClient.setQueryData(['my-restaurant'], (current: { restaurant: Restaurant } | undefined) =>
        current ? { restaurant: { ...current.restaurant, location: data.location } } : current
      )
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Location details</DialogTitle>
          <DialogDescription>
            Contact info and address for this restaurant&apos;s primary location.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='restaurant-location-form'
            onSubmit={form.handleSubmit((values) => mutate(values))}
            className='space-y-4'
          >
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='contact_email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact email</FormLabel>
                    <FormControl>
                      <Input type='email' placeholder='sam@goldenfork.example' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='contact_phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact phone</FormLabel>
                    <FormControl>
                      <Input placeholder='+1 555 0100' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder='218 Street 184, Phnom Penh 12211, Cambodia' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='city'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder='Phnom Penh' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='restaurant-location-form' disabled={isPending}>
            Save location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
