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
import { type Cuisine } from '../data/schema'
import { createCuisine, updateCuisine } from '../data/cuisines-api'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  icon: z.string().optional(),
  active: z.boolean(),
})
type CuisineForm = z.infer<typeof formSchema>

type CuisinesMutateDialogProps = {
  currentRow?: Cuisine
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CuisinesMutateDialog({
  currentRow,
  open,
  onOpenChange,
}: CuisinesMutateDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()

  const form = useForm<CuisineForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          icon: currentRow.icon,
          active: currentRow.active,
        }
      : {
          name: '',
          icon: '',
          active: true,
        },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: CuisineForm) =>
      isEdit
        ? updateCuisine(currentRow.cuisine_id, values)
        : createCuisine(values),
    onSuccess: () => {
      toast.success(isEdit ? 'Cuisine updated.' : 'Cuisine created.')
      queryClient.invalidateQueries({ queryKey: ['cuisines'] })
      form.reset()
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  const onSubmit = (values: CuisineForm) => mutate(values)

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
          <DialogTitle>
            {isEdit ? 'Edit Cuisine' : 'Add New Cuisine'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update this cuisine here.'
              : 'Create a new cuisine here.'}{' '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='cuisine-form'
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
                      placeholder='Khmer'
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
              name='icon'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Icon</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='🍜'
                      className='col-span-4'
                      {...field}
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
                  <FormLabel className='col-span-2 text-end'>
                    Active
                  </FormLabel>
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
          <Button type='submit' form='cuisine-form' disabled={isPending}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
