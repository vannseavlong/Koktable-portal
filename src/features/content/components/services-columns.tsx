import { type ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Category } from '@/features/categories/data/schema'
import { type Service } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

type ServicesColumnActions = {
  onToggleActive: (service: Service) => void
  onMoveUp: (service: Service) => void
  onMoveDown: (service: Service) => void
  canMoveUp: (service: Service) => boolean
  canMoveDown: (service: Service) => boolean
  isReordering: boolean
  categoryNameById: Map<string, Category>
}

export function createServicesColumns({
  onToggleActive,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isReordering,
  categoryNameById,
}: ServicesColumnActions): ColumnDef<Service>[] {
  return [
    {
      id: 'order',
      header: () => <div className='w-16'>Order</div>,
      cell: ({ row }) => {
        const service = row.original
        return (
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='size-6'
              disabled={!canMoveUp(service) || isReordering}
              onClick={() => onMoveUp(service)}
              aria-label={`Move ${service.name} up`}
            >
              <ArrowUp className='size-3.5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='size-6'
              disabled={!canMoveDown(service) || isReordering}
              onClick={() => onMoveDown(service)}
              aria-label={`Move ${service.name} down`}
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
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2 ps-1'>
          <span
            className='size-3 shrink-0 rounded-full border'
            style={{ backgroundColor: row.original.color }}
          />
          <LongText className='max-w-48'>{row.getValue('name')}</LongText>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'category_id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Category' />
      ),
      cell: ({ row }) => {
        const category = categoryNameById.get(row.getValue('category_id'))
        return (
          <Badge variant='outline'>
            {category ? `${category.icon ? `${category.icon} ` : ''}${category.name}` : 'Unknown'}
          </Badge>
        )
      },
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
