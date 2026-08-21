import { useRef, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Store, X } from 'lucide-react'
import { toast } from 'sonner'
import { toDisplayImageUrl } from '@/lib/drive-image'
import { handleServerError } from '@/lib/handle-server-error'
import { cn } from '@/lib/utils'
import { useCuisines } from '@/hooks/use-cuisines'
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
import { MultiSelect } from '@/components/ui/multi-select'
import { Textarea } from '@/components/ui/textarea'
import {
  updateMyRestaurant,
  updateMyRestaurantCuisines,
  type RestaurantUpdatePayload,
} from '../data/restaurant-api'
import { type Restaurant } from '../data/schema'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional(),
  // Not .optional()/.default() — toFormValues() below always supplies a concrete
  // array, and mixing zod's input/output split with useForm's single type param
  // (unlike products-mutate-dialog.tsx's two-generic ProductFormInput/ProductForm
  // pattern) breaks resolver typing otherwise.
  cuisines: z.array(z.string()),
})
type RestaurantFormValues = z.infer<typeof formSchema>

// undefined = unchanged, null = cleared, File = a newly picked file to upload.
type ImageEdit = File | null | undefined

// Order-insensitive: MultiSelect appends in click order, which won't generally match
// the order `restaurant.cuisines` came back in from the server.
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const bSet = new Set(b)
  return a.every((v) => bSet.has(v))
}

function toFormValues(restaurant: Restaurant): RestaurantFormValues {
  return {
    name: restaurant.name,
    description: restaurant.description ?? '',
    cuisines: restaurant.cuisines,
  }
}

type ImagePickerProps = {
  label: string
  shape: 'circle' | 'rect'
  currentUrl?: string
  onChange: (value: ImageEdit) => void
}

function ImagePicker({ label, shape, currentUrl, onChange }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    toDisplayImageUrl(currentUrl)
  )

  return (
    <div className='flex items-center gap-3'>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden border bg-muted',
          shape === 'circle' ? 'size-16 rounded-full' : 'h-16 w-28 rounded-md'
        )}
      >
        {previewUrl ? (
          <img src={previewUrl} alt='' className='h-full w-full object-cover' />
        ) : (
          <Store className='size-6 text-muted-foreground' />
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
          {label}
        </Button>
        {previewUrl && (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='text-muted-foreground'
            onClick={() => {
              setPreviewUrl(undefined)
              onChange(null)
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
              onChange(file)
            }
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}

type RestaurantEditDialogProps = {
  restaurant: Restaurant
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RestaurantEditDialog({
  restaurant,
  open,
  onOpenChange,
}: RestaurantEditDialogProps) {
  const queryClient = useQueryClient()
  const { cuisines, isLoading: cuisinesLoading } = useCuisines()
  const [logoEdit, setLogoEdit] = useState<ImageEdit>(undefined)
  const [bannerEdit, setBannerEdit] = useState<ImageEdit>(undefined)

  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormValues(restaurant),
  })

  const { mutate, isPending } = useMutation({
    // Two separate endpoints under the hood (PATCH /merchant/restaurant for profile
    // fields, PUT /merchant/restaurant/cuisines for the replace-all cuisine set — see
    // restaurant-api.ts) fired together so "Save changes" reads as one action to the
    // merchant. Cuisines only sent when actually changed, since its endpoint is a
    // full-set replace, not a diff.
    mutationFn: async ({ cuisines: nextCuisines, ...values }: RestaurantFormValues) => {
      const payload: RestaurantUpdatePayload = { ...values }
      if (logoEdit !== undefined) payload.logo = logoEdit ?? ''
      if (bannerEdit !== undefined) payload.banner = bannerEdit ?? ''

      const [{ restaurant: updated }] = await Promise.all([
        updateMyRestaurant(payload),
        arraysEqual(nextCuisines ?? [], restaurant.cuisines)
          ? Promise.resolve(null)
          : updateMyRestaurantCuisines(nextCuisines ?? []),
      ])
      return { restaurant: { ...updated, cuisines: nextCuisines ?? [] } }
    },
    onSuccess: (data) => {
      toast.success('Restaurant details updated.')
      queryClient.setQueryData(['my-restaurant'], data)
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  const onSubmit = (values: RestaurantFormValues) => mutate(values)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Edit Restaurant Profile</DialogTitle>
          <DialogDescription>
            Update the storefront details customers see in the mobile app. Click
            save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='restaurant-edit-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <div className='space-y-2'>
                <FormLabel>Logo</FormLabel>
                <ImagePicker
                  label='Upload logo'
                  shape='circle'
                  currentUrl={restaurant.logo}
                  onChange={setLogoEdit}
                />
              </div>

              <div className='space-y-2'>
                <FormLabel>Banner</FormLabel>
                <ImagePicker
                  label='Upload banner'
                  shape='rect'
                  currentUrl={restaurant.banner}
                  onChange={setBannerEdit}
                />
              </div>

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant name</FormLabel>
                    <FormControl>
                      <Input placeholder='The Golden Fork' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Contemporary fine dining, serving the north side.'
                        className='resize-none'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='cuisines'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuisines</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={cuisines.map((c) => ({
                          label: c.name,
                          value: c.name,
                          icon: c.icon,
                        }))}
                        selected={field.value ?? []}
                        onChange={field.onChange}
                        disabled={cuisinesLoading}
                        placeholder={
                          cuisinesLoading
                            ? 'Loading cuisines…'
                            : 'Select cuisines...'
                        }
                        searchPlaceholder='Search cuisines...'
                        emptyText='No cuisines found.'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            type='submit'
            form='restaurant-edit-form'
            disabled={isPending}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
