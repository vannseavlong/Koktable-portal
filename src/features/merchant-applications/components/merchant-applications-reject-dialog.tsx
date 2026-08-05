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
import { Textarea } from '@/components/ui/textarea'
import { rejectMerchantApplication } from '../data/merchant-applications-api'
import { type MerchantApplication } from '../data/schema'

const formSchema = z.object({
  reason: z.string().optional(),
})
type RejectForm = z.infer<typeof formSchema>

type MerchantApplicationsRejectDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: MerchantApplication
}

export function MerchantApplicationsRejectDialog({
  open,
  onOpenChange,
  currentRow,
}: MerchantApplicationsRejectDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<RejectForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { reason: '' },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: RejectForm) =>
      rejectMerchantApplication(currentRow.application_id, values.reason),
    onSuccess: () => {
      toast.success(`${currentRow.restaurant_name} rejected.`)
      queryClient.invalidateQueries({ queryKey: ['merchant-applications'] })
      form.reset()
      onOpenChange(false)
    },
    onError: (error) => handleServerError(error),
  })

  const onSubmit = (values: RejectForm) => mutate(values)

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
          <DialogTitle>Reject {currentRow.restaurant_name}?</DialogTitle>
          <DialogDescription>
            Optionally leave a reason — it isn&apos;t shown to the applicant
            yet, but helps future reviewers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='reject-application-form'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Reason (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Missing business details, duplicate application, etc.'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type='submit'
            form='reject-application-form'
            variant='destructive'
            disabled={isPending}
          >
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
