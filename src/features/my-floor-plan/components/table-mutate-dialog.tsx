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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createTable, updateTable } from '../data/floor-plan-api'
import {
  TABLE_SHAPES,
  tableShapeSchema,
  type RestaurantTable,
} from '../data/schema'

const formSchema = z.object({
  label: z.string().min(1, 'Label is required.'),
  seats: z.coerce.number().int().min(1, 'A table needs at least 1 seat.'),
  shape: tableShapeSchema,
  sort_order: z.coerce.number().int().min(0).optional(),
  active: z.boolean(),
})
type TableFormInput = z.input<typeof formSchema>
type TableForm = z.output<typeof formSchema>

type TableMutateDialogProps = {
  roomId: string
  currentRow?: RestaurantTable
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TableMutateDialog({
  roomId,
  currentRow,
  open,
  onOpenChange,
}: TableMutateDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()

  const form = useForm<TableFormInput, unknown, TableForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          label: currentRow.label,
          seats: currentRow.seats,
          shape: currentRow.shape,
          sort_order: currentRow.sort_order,
          active: currentRow.active,
        }
      : { label: '', seats: 2, shape: 'round', sort_order: 0, active: true },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: TableForm) =>
      isEdit
        ? updateTable(currentRow.table_id, values)
        : createTable({ ...values, room_id: roomId }),
    onSuccess: () => {
      toast.success(isEdit ? 'Table updated.' : 'Table added.')
      queryClient.invalidateQueries({ queryKey: ['floor-plan-tables', roomId] })
      form.reset()
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  const onSubmit = (values: TableForm) => mutate(values)

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
          <DialogTitle>{isEdit ? 'Edit Table' : 'Add Table'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update this table here.'
              : 'Add a new table within this room.'}{' '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='table-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 px-0.5 py-1'
          >
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Label</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='T1'
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
              name='seats'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Seats</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={1}
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
              name='shape'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Shape</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='col-span-4'>
                        <SelectValue placeholder='Select a shape' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TABLE_SHAPES.map((shape) => (
                        <SelectItem
                          key={shape}
                          value={shape}
                          className='capitalize'
                        >
                          {shape}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          <Button type='submit' form='table-form' disabled={isPending}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
