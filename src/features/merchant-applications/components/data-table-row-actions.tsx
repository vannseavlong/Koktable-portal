import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Check, Eye, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type MerchantApplication } from '../data/schema'
import { useMerchantApplications } from './merchant-applications-provider'

type DataTableRowActionsProps = {
  row: Row<MerchantApplication>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useMerchantApplications()
  const application = row.original
  const isPending = application.status === 'pending'
  const isApproved = application.status === 'approved'

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-44'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(application)
            setOpen('detail')
          }}
        >
          View details
          <Eye className='ms-auto size-4' />
        </DropdownMenuItem>
        {isPending && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(application)
                setOpen('approve')
              }}
            >
              Approve
              <Check className='ms-auto size-4' />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(application)
                setOpen('reject')
              }}
              className='text-red-500!'
            >
              Reject
              <X className='ms-auto size-4' />
            </DropdownMenuItem>
          </>
        )}
        {isApproved && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(application)
                setOpen('resend')
              }}
            >
              Resend invite
              <RefreshCw className='ms-auto size-4' />
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
