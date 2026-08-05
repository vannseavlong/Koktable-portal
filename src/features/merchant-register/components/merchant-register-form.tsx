import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Send } from 'lucide-react'
import { handleServerError } from '@/lib/handle-server-error'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { applyMerchant } from '../data/merchant-register-api'
import { merchantApplySchema, type MerchantApplyInput } from '../data/schema'

type MerchantRegisterFormProps = React.HTMLAttributes<HTMLFormElement> & {
  onSuccess: () => void
}

export function MerchantRegisterForm({
  className,
  onSuccess,
  ...props
}: MerchantRegisterFormProps) {
  const form = useForm<MerchantApplyInput>({
    resolver: zodResolver(merchantApplySchema),
    defaultValues: {
      restaurant_name: '',
      applicant_name: '',
      contact_email: '',
      contact_phone: '',
      description: '',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: MerchantApplyInput) => applyMerchant(values),
    onSuccess,
    onError: (error) => handleServerError(error),
  })

  function onSubmit(values: MerchantApplyInput) {
    mutate(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='restaurant_name'
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
          name='applicant_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your name</FormLabel>
              <FormControl>
                <Input placeholder='Sam Rivera' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='contact_email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact email</FormLabel>
              <FormControl>
                <Input placeholder='sam@example.com' {...field} />
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
              <FormLabel>Phone (optional)</FormLabel>
              <FormControl>
                <Input placeholder='+1 555 0100' {...field} />
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
              <FormLabel>Tell us about your restaurant (optional)</FormLabel>
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
        <Button className='mt-2' disabled={isPending}>
          {isPending ? <Loader2 className='animate-spin' /> : <Send />}
          Submit application
        </Button>
      </form>
    </Form>
  )
}
