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
import { Textarea } from '@/components/ui/textarea'
import { useCategories } from '@/hooks/use-categories'
import { createCatalogItem, updateCatalogItem } from '../data/catalog-items-api'
import { type CatalogItem } from '../data/schema'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional(),
  price_from: z.coerce.number().min(0, 'Price must be 0 or more.'),
  category_id: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  active: z.boolean(),
  sort_order: z.coerce.number().int().min(0).optional(),
  // Left blank means "unlimited" concurrent reservations.
  daily_capacity: z.coerce.number().min(0).optional(),
})
// `price_from`/`sort_order` are coerced from the raw string an <input> gives
// us, so the form's field values (input) differ from the submitted payload
// (output) — react-hook-form needs both generics to type-check the resolver.
type CatalogItemFormInput = z.input<typeof formSchema>
type CatalogItemForm = z.output<typeof formSchema>

type CatalogItemsMutateDialogProps = {
  currentRow?: CatalogItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CatalogItemsMutateDialog({
  currentRow,
  open,
  onOpenChange,
}: CatalogItemsMutateDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const { categories } = useCategories()

  const form = useForm<CatalogItemFormInput, unknown, CatalogItemForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          description: currentRow.description,
          price_from: currentRow.price_from,
          category_id: currentRow.category_id,
          icon: currentRow.icon,
          color: currentRow.color,
          active: currentRow.active,
          sort_order: currentRow.sort_order,
          daily_capacity: currentRow.daily_capacity,
        }
      : {
          name: '',
          description: '',
          price_from: 0,
          category_id: '',
          icon: '',
          color: '',
          active: true,
          sort_order: 0,
        },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: CatalogItemForm) =>
      isEdit
        ? updateCatalogItem(currentRow.item_id, values)
        : createCatalogItem(values),
    onSuccess: () => {
      toast.success(isEdit ? 'Item updated.' : 'Item created.')
      queryClient.invalidateQueries({ queryKey: ['my-catalog-items'] })
      form.reset()
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  const onSubmit = (values: CatalogItemForm) => mutate(values)

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
            {isEdit ? 'Edit Service' : 'Add New Service'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update this service here.'
              : 'Create a new service your restaurant offers.'}{' '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='catalog-item-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Mobile Bath & Groom'
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
                name='description'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='At your door, 45 minutes.'
                        className='col-span-4 resize-none'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='price_from'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Price from
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        step='0.01'
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
                name='category_id'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Category
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className='col-span-4'>
                          <SelectValue placeholder='Select a category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.category_id}
                            value={category.category_id}
                          >
                            {category.icon ? `${category.icon} ` : ''}
                            {category.name}
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
                name='icon'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Icon</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='spray_bottle'
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
                name='color'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Color</FormLabel>
                    <FormControl>
                      <div className='col-span-4 flex items-center gap-2'>
                        <input
                          type='color'
                          value={
                            /^#[0-9a-fA-F]{6}$/.test(field.value ?? '')
                              ? field.value
                              : '#D6EAE4'
                          }
                          onChange={(e) => field.onChange(e.target.value)}
                          className='h-9 w-10 shrink-0 cursor-pointer rounded border'
                        />
                        <Input
                          placeholder='#D6EAE4'
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </div>
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
                name='daily_capacity'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Daily capacity
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        step='1'
                        placeholder='Leave blank for unlimited'
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
        </div>
        <DialogFooter>
          <Button type='submit' form='catalog-item-form' disabled={isPending}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
