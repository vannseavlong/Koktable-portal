import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { statusLabels } from '../data/data'
import { nextStatusOptions, type Restaurant } from '../data/schema'
import { useRestaurants } from './restaurants-provider'

type DataTableRowActionsProps = {
  row: Row<Restaurant>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow, setTargetStatus } = useRestaurants()
  const restaurant = row.original
  const transitions = nextStatusOptions[restaurant.status]

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
            setCurrentRow(restaurant)
            setOpen('detail')
          }}
        >
          View details
          <Eye className='ms-auto size-4' />
        </DropdownMenuItem>
        {transitions.length > 0 && <DropdownMenuSeparator />}
        {transitions.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => {
              setCurrentRow(restaurant)
              setTargetStatus(status)
              setOpen('status')
            }}
            className={status === 'suspended' ? 'text-red-500!' : undefined}
          >
            {statusLabels[status] === 'Suspended' ? 'Suspend' : 'Reactivate'}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
