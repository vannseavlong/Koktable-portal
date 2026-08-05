import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type Category } from '../data/schema'
import { reorderCategories, updateCategory } from '../data/categories-api'
import { createCategoriesColumns } from './categories-columns'

type DataTableProps = {
  data: Category[]
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function CategoriesTable({ data, search, navigate }: DataTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const queryClient = useQueryClient()

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'search' },
    columnFilters: [{ columnId: 'active', searchKey: 'active', type: 'array' }],
  })

  const toggleActiveMutation = useMutation({
    mutationFn: (category: Category) =>
      updateCategory(category.category_id, { active: !category.active }),
    onSuccess: (_, category) => {
      toast.success(
        `"${category.name}" is now ${category.active ? 'inactive' : 'active'}.`
      )
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error) => handleServerError(error),
  })

  const reorderMutation = useMutation({
    mutationFn: (order: string[]) => reorderCategories(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error) => handleServerError(error),
  })

  const move = (category: Category, direction: 'up' | 'down') => {
    const index = data.findIndex((c) => c.category_id === category.category_id)
    const swapWith = direction === 'up' ? index - 1 : index + 1
    if (index < 0 || swapWith < 0 || swapWith >= data.length) return

    const reordered = [...data]
    ;[reordered[index], reordered[swapWith]] = [
      reordered[swapWith],
      reordered[index],
    ]
    reorderMutation.mutate(reordered.map((c) => c.category_id))
  }

  const columns = createCategoriesColumns({
    onToggleActive: (category) => toggleActiveMutation.mutate(category),
    onMoveUp: (category) => move(category, 'up'),
    onMoveDown: (category) => move(category, 'down'),
    canMoveUp: (category) =>
      data.findIndex((c) => c.category_id === category.category_id) > 0,
    canMoveDown: (category) =>
      data.findIndex((c) => c.category_id === category.category_id) <
      data.length - 1,
    isReordering: reorderMutation.isPending,
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const term = filterValue.trim().toLowerCase()
      if (!term) return true
      const category = row.original as Category
      return category.name.toLowerCase().includes(term)
    },
    onPaginationChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search by name...'
        filters={[
          {
            columnId: 'active',
            title: 'Status',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'bg-background group-hover/row:bg-muted',
                      header.column.columnDef.meta?.className
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className='group/row'>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted',
                        cell.column.columnDef.meta?.className
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
