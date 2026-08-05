import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { statusLabels, statusStyles } from '../data/data'
import { primaryLocation } from '../data/location-schema'
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
    id: 'city',
    accessorFn: (row) => primaryLocation(row.locations)?.city ?? '',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='City' />
    ),
    cell: ({ getValue }) => (
      <span className='text-nowrap'>{(getValue() as string) || '—'}</span>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: 'cuisine',
    accessorFn: (row) => row.cuisines ?? [],
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cuisine' />
    ),
    cell: ({ row }) => {
      const cuisine = row.original.cuisines ?? []
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
    accessorFn: (row) => primaryLocation(row.locations)?.rating ?? 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Rating' />
    ),
    cell: ({ row }) => {
      const location = primaryLocation(row.original.locations)
      if (location?.rating == null) return <span className='text-muted-foreground'>—</span>
      return (
        <div className='text-nowrap'>
          <span>★ {location.rating.toFixed(1)}</span>
          {location.rating_count != null && (
            <span className='text-xs text-muted-foreground'> ({location.rating_count})</span>
          )}
        </div>
      )
    },
  },
  {
    id: 'price',
    accessorFn: (row) => primaryLocation(row.locations)?.price_level ?? 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => (
      <span className='text-nowrap'>{primaryLocation(row.original.locations)?.price_symbol || '—'}</span>
    ),
  },
  {
    id: 'contact',
    accessorFn: (row) => {
      const location = primaryLocation(row.locations)
      return `${location?.contact_email ?? ''} ${location?.contact_phone ?? ''}`
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contact' />
    ),
    cell: ({ row }) => {
      const location = primaryLocation(row.original.locations)
      return (
        <div className='flex flex-col'>
          <span>{location?.contact_email || '—'}</span>
          {location?.contact_phone && (
            <span className='text-xs text-muted-foreground'>
              {location.contact_phone}
            </span>
          )}
        </div>
      )
    },
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
