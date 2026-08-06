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
import { Switch } from '@/components/ui/switch'
import { createRoom, updateRoom } from '../data/floor-plan-api'
import { type Room } from '../data/schema'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  sort_order: z.coerce.number().int().min(0).optional(),
  active: z.boolean(),
})
type RoomFormInput = z.input<typeof formSchema>
type RoomForm = z.output<typeof formSchema>

type RoomMutateDialogProps = {
  floorId: string
  currentRow?: Room
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoomMutateDialog({
  floorId,
  currentRow,
  open,
  onOpenChange,
}: RoomMutateDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()

  const form = useForm<RoomFormInput, unknown, RoomForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          sort_order: currentRow.sort_order,
          active: currentRow.active,
        }
      : { name: '', sort_order: 0, active: true },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: RoomForm) =>
      isEdit
        ? updateRoom(currentRow.room_id, values)
        : createRoom({ ...values, floor_id: floorId }),
    onSuccess: () => {
      toast.success(isEdit ? 'Room updated.' : 'Room added.')
      queryClient.invalidateQueries({ queryKey: ['floor-plan-rooms', floorId] })
      form.reset()
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  const onSubmit = (values: RoomForm) => mutate(values)

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Room' : 'Add Room'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update this room here.'
              : 'Add a new section within this floor.'}{' '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='room-form'
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
                      placeholder='Main Hall'
                      className='col-span-4'
                      autoComplete='off'
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='sort_order'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>
                    Sort order
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      step='1'
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
              name='active'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Active</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='room-form' disabled={isPending}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
