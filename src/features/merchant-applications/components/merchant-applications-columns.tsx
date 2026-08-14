import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { formatDate, statusLabels, statusStyles } from '../data/data'
import { type MerchantApplication } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const merchantApplicationsColumns: ColumnDef<MerchantApplication>[] = [
  {
    accessorKey: 'restaurant_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Restaurant' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48 ps-3'>
        {row.getValue('restaurant_name')}
      </LongText>
    ),
    enableHiding: false,
  },
  {
    id: 'applicant',
    accessorFn: (row) => `${row.applicant_name} ${row.contact_email}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Applicant' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span>{row.original.applicant_name}</span>
        <span className='text-xs text-muted-foreground'>
          {row.original.contact_email}
        </span>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: '_created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Submitted' />
    ),
    cell: ({ row }) => (
      <div className='text-nowrap'>{formatDate(row.original._created_at)}</div>
    ),
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
