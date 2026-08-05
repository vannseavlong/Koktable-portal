import { type ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Cuisine } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

type CuisinesColumnActions = {
  onToggleActive: (cuisine: Cuisine) => void
  onMoveUp: (cuisine: Cuisine) => void
  onMoveDown: (cuisine: Cuisine) => void
  canMoveUp: (cuisine: Cuisine) => boolean
  canMoveDown: (cuisine: Cuisine) => boolean
  isReordering: boolean
}

export function createCuisinesColumns({
  onToggleActive,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isReordering,
}: CuisinesColumnActions): ColumnDef<Cuisine>[] {
  return [
    {
      id: 'order',
      header: () => <div className='w-16'>Order</div>,
      cell: ({ row }) => {
        const cuisine = row.original
        return (
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='size-6'
              disabled={!canMoveUp(cuisine) || isReordering}
              onClick={() => onMoveUp(cuisine)}
              aria-label={`Move ${cuisine.name} up`}
            >
              <ArrowUp className='size-3.5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='size-6'
              disabled={!canMoveDown(cuisine) || isReordering}
              onClick={() => onMoveDown(cuisine)}
              aria-label={`Move ${cuisine.name} down`}
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
