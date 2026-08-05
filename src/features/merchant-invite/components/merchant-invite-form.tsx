import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2, LogIn } from 'lucide-react'
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
import { PasswordInput } from '@/components/password-input'
import { acceptMerchantInvite } from '../data/merchant-invite-api'
import {
  merchantInviteAcceptSchema,
  type MerchantInviteAcceptInput,
} from '../data/schema'

type MerchantInviteFormProps = React.HTMLAttributes<HTMLFormElement> & {
  token: string
  onSuccess: () => void
}

export function MerchantInviteForm({
  className,
  token,
  onSuccess,
  ...props
}: MerchantInviteFormProps) {
  const form = useForm<MerchantInviteAcceptInput>({
    resolver: zodResolver(merchantInviteAcceptSchema),
    defaultValues: { full_name: '', password: '', confirmPassword: '' },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: MerchantInviteAcceptInput) =>
      acceptMerchantInvite(token, {
        full_name: values.full_name,
        password: values.password,
      }),
    onSuccess,
    onError: (error) => handleServerError(error),
  })

  function onSubmit(values: MerchantInviteAcceptInput) {
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
          name='full_name'
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
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isPending}>
          {isPending ? <Loader2 className='animate-spin' /> : <LogIn />}
          Set password
        </Button>
      </form>
    </Form>
  )
}
