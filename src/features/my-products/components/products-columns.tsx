import { type ColumnDef } from '@tanstack/react-table'
import { ImageIcon } from 'lucide-react'
import { toDisplayImageUrl } from '@/lib/drive-image'
import { Switch } from '@/components/ui/switch'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Category } from '@/features/categories/data/schema'
import { type Product } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

type ProductsColumnActions = {
  onToggleActive: (item: Product) => void
  isToggling: boolean
  categoryNameById: Map<string, Category>
}

export function createProductsColumns({
  onToggleActive,
  isToggling,
  categoryNameById,
}: ProductsColumnActions): ColumnDef<Product>[] {
  return [
    {
      id: 'image',
      header: 'Image',
      cell: ({ row }) => {
        const image = toDisplayImageUrl(row.original.image)
        return (
          <div className='flex size-10 items-center justify-center overflow-hidden rounded-md border bg-muted'>
            {image ? (
              <img src={image} alt='' className='h-full w-full object-cover' />
            ) : (
              <ImageIcon className='size-4 text-muted-foreground' />
            )}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-48'>{row.getValue('name')}</LongText>
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
        <DataTableColumnHeader column={column} title='Price' />
      ),
      cell: ({ row }) => {
        const price = row.getValue<number>('price_from')
        return <div>${price.toFixed(2)}</div>
      },
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Stock' />
      ),
      cell: ({ row }) => {
        const quantity = row.original.quantity
        if (quantity === undefined) {
          return <span className='text-muted-foreground'>Unlimited</span>
        }
        return (
          <span
            className={quantity === 0 ? 'font-medium text-destructive' : ''}
          >
            {quantity}
          </span>
        )
      },
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
