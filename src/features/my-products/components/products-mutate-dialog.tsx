import { useRef, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ImageIcon, ImagePlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { toDisplayImageUrl } from '@/lib/drive-image'
import { handleServerError } from '@/lib/handle-server-error'
import { useCategories } from '@/hooks/use-categories'
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
import { createProduct, updateProduct } from '../data/products-api'
import { type Product } from '../data/schema'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional(),
  price_from: z.coerce.number().min(0, 'Price must be 0 or more.'),
  category_id: z.string().optional(),
  active: z.boolean(),
  // Left blank means "unlimited" stock.
  quantity: z.coerce.number().min(0).optional(),
})
// `price_from`/`quantity` are coerced from the raw string an <input> gives
// us, so the form's field values (input) differ from the submitted payload
// (output) — react-hook-form needs both generics to type-check the resolver.
type ProductFormInput = z.input<typeof formSchema>
type ProductForm = z.output<typeof formSchema>

// undefined = unchanged, null = cleared, File = a newly picked file to upload.
type ImageEdit = File | null | undefined

type ProductsMutateDialogProps = {
  currentRow?: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductsMutateDialog({
  currentRow,
  open,
  onOpenChange,
}: ProductsMutateDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const { categories } = useCategories()
  const inputRef = useRef<HTMLInputElement>(null)
  const [imageEdit, setImageEdit] = useState<ImageEdit>(undefined)
  const currentImage = toDisplayImageUrl(currentRow?.image)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImage)

  const form = useForm<ProductFormInput, unknown, ProductForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          description: currentRow.description,
          price_from: currentRow.price_from,
          category_id: currentRow.category_id,
          active: currentRow.active,
          quantity: currentRow.quantity,
        }
      : {
          name: '',
          description: '',
          price_from: 0,
          category_id: '',
          active: true,
        },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: ProductForm) => {
      const payload = {
        ...values,
        image: imageEdit === undefined ? undefined : (imageEdit ?? ''),
      }
      return isEdit
        ? updateProduct(currentRow.item_id, payload)
        : createProduct(payload)
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Menu item updated.' : 'Menu item added.')
      queryClient.invalidateQueries({ queryKey: ['my-products'] })
      form.reset()
      setImageEdit(undefined)
      setPreviewUrl(currentImage)
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  const onSubmit = (values: ProductForm) => mutate(values)

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        setImageEdit(undefined)
        setPreviewUrl(currentImage)
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update this menu item here.'
              : 'Add a dish or item to your menu, with a price and photo.'}{' '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='product-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <div className='flex items-center gap-3'>
                <div className='flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted'>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt=''
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <ImageIcon className='size-8 text-muted-foreground' />
                  )}
                </div>
                <div className='flex flex-col items-start gap-1'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => inputRef.current?.click()}
                  >
                    <ImagePlus />
                    Upload image
                  </Button>
                  {previewUrl && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='text-muted-foreground'
                      onClick={() => {
                        setPreviewUrl(undefined)
                        setImageEdit(null)
                      }}
                    >
                      <X /> Remove
                    </Button>
                  )}
                  <input
                    ref={inputRef}
                    type='file'
                    accept='image/jpeg,image/png,image/webp'
                    className='hidden'
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setPreviewUrl(URL.createObjectURL(file))
                        setImageEdit(file)
                      }
                      e.target.value = ''
                    }}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Grilled Chicken'
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
                        placeholder='Grilled chicken breast served with rice and vegetables.'
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
                    <FormLabel className='col-span-2 text-end'>Price</FormLabel>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name='quantity'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Stock quantity
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
          <Button type='submit' form='product-form' disabled={isPending}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
