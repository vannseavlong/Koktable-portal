import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { formatDate, statusLabels, statusStyles } from '../data/data'
import { type Order } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const myOrdersColumns: ColumnDef<Order>[] = [
  {
    accessorKey: 'reservation_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-xs text-muted-foreground'>
        {row.getValue('reservation_id')}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'guest',
    accessorFn: (row) => `${row.guest_name} (${row.party_size})`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Guest' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>
        {row.original.guest_name}{' '}
        <span className='text-muted-foreground'>({row.original.party_size})</span>
      </LongText>
    ),
  },
  {
    accessorKey: 'service_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Item' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-40'>{row.getValue('service_name')}</LongText>
    ),
  },
  {
    id: 'dates',
    accessorFn: (row) => `${row.start_date} to ${row.end_date}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dates' />
    ),
    cell: ({ row }) => (
      <div className='text-nowrap'>
        {formatDate(row.original.start_date)} →{' '}
        {formatDate(row.original.end_date)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'customer',
    accessorFn: (row) => `${row.user_name} ${row.user_email}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span>{row.original.user_name}</span>
        <span className='text-xs text-muted-foreground'>
          {row.original.user_email}
        </span>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'total',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total' />
    ),
    cell: ({ row }) => <div>${row.original.total.toFixed(2)}</div>,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const { status } = row.original
      return (
        <Badge
          variant='outline'
          className={cn('capitalize', statusStyles.get(status))}
        >
          {statusLabels[status]}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
