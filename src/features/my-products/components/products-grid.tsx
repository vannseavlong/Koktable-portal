import { type Row } from '@tanstack/react-table'
import { ImageIcon } from 'lucide-react'
import { toDisplayImageUrl } from '@/lib/drive-image'
import { Switch } from '@/components/ui/switch'
import { type Category } from '@/features/categories/data/schema'
import { type Product } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

type ProductsGridProps = {
  rows: Row<Product>[]
  categoryNameById: Map<string, Category>
  onToggleActive: (item: Product) => void
  isToggling: boolean
}

// Card-grid counterpart to ProductsTable's row layout — same filtered/sorted/paginated
// `rows` from the table instance, just rendered as cards instead of table rows, so photos
// (the whole point of a menu item) are visible without opening each row.
export function ProductsGrid({
  rows,
  categoryNameById,
  onToggleActive,
  isToggling,
}: ProductsGridProps) {
  if (!rows.length) {
    return (
      <div className='flex h-24 items-center justify-center rounded-md border text-muted-foreground'>
        No results.
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {rows.map((row) => {
        const item = row.original
        const image = toDisplayImageUrl(item.image)
        return (
          <div
            key={item.item_id}
            className='flex flex-col overflow-hidden rounded-md border bg-background'
          >
            <div className='flex aspect-video items-center justify-center overflow-hidden bg-muted'>
              {image ? (
                <img
                  src={image}
                  alt=''
                  className='h-full w-full object-cover'
                />
              ) : (
                <ImageIcon className='size-8 text-muted-foreground' />
              )}
            </div>
            <div className='flex flex-1 flex-col gap-1 p-3'>
              <div className='flex items-start justify-between gap-2'>
                <span className='line-clamp-2 font-medium'>{item.name}</span>
                <DataTableRowActions row={row} />
              </div>
              <span className='text-sm text-muted-foreground'>
                {categoryNameById.get(item.category_id ?? '')?.name ?? '—'}
              </span>
              <div className='mt-auto flex items-center justify-between pt-2'>
                <span className='font-medium'>
                  ${item.price_from.toFixed(2)}
                </span>
                <Switch
                  checked={item.active}
                  disabled={isToggling}
                  onCheckedChange={() => onToggleActive(item)}
                  aria-label={`Toggle ${item.name} active state`}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
