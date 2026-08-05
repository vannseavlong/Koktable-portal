import { type ColumnDef } from '@tanstack/react-table'
import { Switch } from '@/components/ui/switch'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Category } from '@/features/categories/data/schema'
import { type CatalogItem } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

type CatalogItemsColumnActions = {
  onToggleActive: (item: CatalogItem) => void
  isToggling: boolean
  categoryNameById: Map<string, Category>
}

export function createCatalogItemsColumns({
  onToggleActive,
  isToggling,
  categoryNameById,
}: CatalogItemsColumnActions): ColumnDef<CatalogItem>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-48 ps-3'>{row.getValue('name')}</LongText>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'category_id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Category' />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground'>
          {categoryNameById.get(row.getValue('category_id'))?.name ?? '—'}
        </span>
      ),
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'price_from',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Price from' />
      ),
      cell: ({ row }) => {
        const price = row.getValue<number>('price_from')
        return <div>${price.toFixed(2)}</div>
      },
    },
    {
      id: 'daily_capacity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Daily Capacity' />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground'>
          {row.original.daily_capacity ?? 'Unlimited'}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Description' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-64 text-muted-foreground'>
          {row.getValue('description') || '—'}
        </LongText>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'active',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Active' />
      ),
      cell: ({ row }) => (
        <Switch
          checked={row.original.active}
          disabled={isToggling}
          onCheckedChange={() => onToggleActive(row.original)}
          aria-label={`Toggle ${row.original.name} active state`}
        />
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id) ? 'active' : 'inactive')
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: DataTableRowActions,
    },
  ]
}
