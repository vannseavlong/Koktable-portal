import { type ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Category } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

type CategoriesColumnActions = {
  onToggleActive: (category: Category) => void
  onMoveUp: (category: Category) => void
  onMoveDown: (category: Category) => void
  canMoveUp: (category: Category) => boolean
  canMoveDown: (category: Category) => boolean
  isReordering: boolean
}

export function createCategoriesColumns({
  onToggleActive,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isReordering,
}: CategoriesColumnActions): ColumnDef<Category>[] {
  return [
    {
      id: 'order',
      header: () => <div className='w-16'>Order</div>,
      cell: ({ row }) => {
        const category = row.original
        return (
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='size-6'
              disabled={!canMoveUp(category) || isReordering}
              onClick={() => onMoveUp(category)}
              aria-label={`Move ${category.name} up`}
            >
              <ArrowUp className='size-3.5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='size-6'
              disabled={!canMoveDown(category) || isReordering}
              onClick={() => onMoveDown(category)}
              aria-label={`Move ${category.name} down`}
            >
              <ArrowDown className='size-3.5' />
            </Button>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'icon',
      header: () => <div className='w-10'>Icon</div>,
      cell: ({ row }) => (
        <span className='text-lg'>{row.getValue('icon') || '—'}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'active',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Active' />
      ),
      cell: ({ row }) => (
        <Switch
          checked={row.original.active}
          disabled={isReordering}
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
