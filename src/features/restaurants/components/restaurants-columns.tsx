import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { statusLabels, statusStyles } from '../data/data'
import { type Restaurant } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const restaurantsColumns: ColumnDef<Restaurant>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Restaurant' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48 ps-3'>{row.getValue('name')}</LongText>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'city',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='City' />
    ),
    cell: ({ row }) => (
      <span className='text-nowrap'>{row.getValue('city') || '—'}</span>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'cuisine',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cuisine' />
    ),
    cell: ({ row }) => {
      const cuisine = row.original.cuisine ?? []
      if (cuisine.length === 0) return <span className='text-muted-foreground'>—</span>
      return (
        <div className='flex max-w-48 flex-wrap gap-1'>
          {cuisine.map((c) => (
            <Badge key={c} variant='secondary' className='font-normal'>
              {c}
            </Badge>
          ))}
        </div>
      )
    },
    filterFn: (row, id, value: string[]) => {
      const cellCuisine = (row.getValue(id) as string[] | undefined) ?? []
      return value.some((v) => cellCuisine.includes(v))
    },
    enableSorting: false,
  },
  {
    id: 'rating',
    accessorFn: (row) => row.rating ?? 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Rating' />
    ),
    cell: ({ row }) => {
      const { rating, rating_count } = row.original
      if (rating == null) return <span className='text-muted-foreground'>—</span>
      return (
        <div className='text-nowrap'>
          <span>★ {rating.toFixed(1)}</span>
          {rating_count != null && (
            <span className='text-xs text-muted-foreground'> ({rating_count})</span>
          )}
        </div>
      )
    },
  },
  {
    id: 'price',
    accessorFn: (row) => row.price_level ?? 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => (
      <span className='text-nowrap'>{row.original.price_symbol || '—'}</span>
    ),
  },
  {
    id: 'contact',
    accessorFn: (row) =>
      `${row.contact_email ?? ''} ${row.contact_phone ?? ''}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contact' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span>{row.original.contact_email || '—'}</span>
        {row.original.contact_phone && (
          <span className='text-xs text-muted-foreground'>
            {row.original.contact_phone}
          </span>
        )}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'owner',
    accessorKey: 'owner_user_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Owner' />
    ),
    cell: ({ row }) =>
      row.original.owner_user_id ? (
        <span className='font-mono text-xs'>{row.original.owner_user_id}</span>
      ) : (
        <span className='text-xs text-muted-foreground'>
          Invite not yet redeemed
        </span>
      ),
    enableSorting: false,
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
